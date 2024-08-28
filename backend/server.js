// server.js

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const app = express();
const port = 3010;

app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}));

const pool = new Pool({
  user: 'tommal',
  host: '10.100.0.30',
  database: 'repo-fis',
  password: 'tommal',
  port: 5432,
});

app.use(express.json());


// ---------------------------------------------------------------------------
// const pathToSave = "/Users/tommal/Desktop/fis-version-manager/backend/assets/logs/"
const pathToSave = "/uploads/"

// Endpoint to handle file uploads
app.post('/upload_single', (req, res) => {
  if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('multipart/form-data')) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.join('/uploads', req.headers['x-file-name']);

  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);

  writeStream.on('error', (err) => {
    console.error('Error writing file:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  });

  writeStream.on('finish', () => {
    console.log('File uploaded successfully');
    res.json({ message: 'File uploaded successfully' });
  });
});
// ---------------------------------------------------------------------------


app.post('/upload', (req, res) => {


  const { piva, license } = req.query;

  console.log(piva)
  console.log(license)

  checkAndCreateFolder(piva, license);

  if (!req.headers['content-type'] || !req.headers['content-type'].startsWith('multipart/form-data')) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Generate a unique folder name using timestamp
  const timestamp = new Date().toLocaleString().replace(/[/:, ]/g, '-');

  const folderName = piva + "_" + license + "_" + `${timestamp}`;

  // Create the folder
  const folderPath = path.join(pathToSave + `${piva}_${license}`, "");
  // fs.mkdirSync(folderPath, { recursive: true });

  // Set the file path within the generated folder
  const fileName = req.headers['x-file-name'];

  // const fileName = `logs_${format(new Date(), 'yyyyMMdd_HHmmss')}.zip`;

  const filePath = path.join(folderPath, fileName);

  const writeStream = fs.createWriteStream(filePath);
  req.pipe(writeStream);

  writeStream.on('error', (err) => {
    console.error('Error writing file:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  });

  writeStream.on('finish', () => {
    console.log('File uploaded successfully');
    res.json({ message: 'File uploaded successfully' });
  });
});

function checkAndCreateFolder(piva, license) {
  const folderName = `${piva}_${license}`;
  const folderPath = path.join(pathToSave, folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder '${folderName}' created.`);
  } else {
    console.log(`Folder '${folderName}' already exists.`);
  }
}


app.get('/', (req, res) => {
  res.send('Hello, this is Fiscality version management system');
});



app.get('/checkUpdateAvailable/:piva/:envLicense', async (req, res) => {
  const { piva, envLicense } = req.params;

  try {
    const result = await pool.query('SELECT remoteVersion,currentVersion FROM fisuserversions WHERE PIVA = $1 AND licenza = $2', [piva, envLicense]);

    if (result.rows.length > 0) {
      const remoteVersion = result.rows[0].remoteversion;
      const currentVersion = result.rows[0].currentversion;
      const updateAvailable = (compareVersions(remoteVersion, currentVersion) > 0) ? remoteVersion : "0";

      res.json({ updateAvailable });
    } else {
      res.status(404).json({ error: 'Remote version not found for the provided PIVA' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// Update the current version after installing it
app.put('/updateCurrentVersion/:piva/:envLicense', async (req, res) => {
  const { piva, envLicense } = req.params;

  try {
    const result = await pool.query(
      'UPDATE fisuserversions SET currentVersion = remoteVersion, installing = false, timestampUpdate = CURRENT_TIMESTAMP WHERE PIVA = $1 AND licenza = $2 RETURNING *',
      [piva, envLicense]
    );

    if (result.rows.length > 0) {
      res.json({ message: 'Current version updated successfully', updatedVersion: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Current version update failed. PIV or envLicense not found.' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});


// Mark as installing the update 
app.put('/markAsInstalling/:piva/:envLicense', async (req, res) => {
  const { piva, envLicense } = req.params;

  try {
    const result = await pool.query(
      'UPDATE fisuserversions SET installing = true, timestampUpdate = CURRENT_TIMESTAMP WHERE PIVA = $1 AND licenza = $2 RETURNING *',
      [piva, envLicense]
    );

    if (result.rows.length > 0) {
      res.json({ message: 'Marked as installing successfully', updatedVersion: result.rows[0] });
    } else {
      res.status(404).json({ error: 'The operation of marking failed. PIV or envLicense not found.' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});


app.get('/canWeinstall/:piva/:envLicense', async (req, res) => {
  const { piva, envLicense } = req.params;

  try {
    const result = await pool.query('SELECT installing, remoteversion, currentversion  FROM fisuserversions WHERE PIVA = $1 AND licenza = $2', [piva, envLicense]);

    if (result.rows.length > 0) {
      const remoteVersion = result.rows[0].remoteversion
      const currentVersion = result.rows[0].currentversion

      console.log("remoteVersion", remoteVersion)
      console.log("currentVersion", currentVersion)


      const response = (remoteVersion === currentVersion) || (result.rows[0].installing !== null && result.rows[0].installing);

      res.json({ alreadyInstalling: response });
    } else {
      res.status(404).json({ error: 'No record founded' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});


// Custom version comparison function
function compareVersions(versionA, versionB) {
  const partsA = versionA.split('.').map(Number);
  const partsB = versionB.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    if (partsA[i] > (partsB[i] || 0)) return 1;
    if (partsA[i] < (partsB[i] || 0)) return -1;
  }

  return 0;
}





app.put('/updateRemoteVersions', async (req, res) => {
  const selectedVersions = req.body;

  try {
    // Assuming your database has a method to update remote versions based on selected rows
    await updateRemoteVersions(selectedVersions);
    res.status(200).json({ message: 'Remote versions updated successfully' });
  } catch (error) {
    console.error('Error updating remote versions', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});

// Function to update remote versions in the database
async function updateRemoteVersions(selectedVersions) {

  const updateQueries = selectedVersions.map(({ PIVA, newRemoteVersion, license }) => {
    return pool.query(
      'UPDATE fisuserversions SET remoteVersion = $1, timestampUpdate = CURRENT_TIMESTAMP WHERE PIVA = $2 AND licenza= $3',
      [newRemoteVersion, PIVA, license]
    );
  });

  // Execute all update queries concurrently
  await Promise.all(updateQueries);
}


// Retrieve data from PostgreSQL
app.get('/versions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fisuserversions');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to add a new user
app.post('/newuser', async (req, res) => {
  const { piva, version, licenseEnvironment, os } = req.body;
  console.log(os);

  try {
    const remoteVersion = version;
    const currentVersion = version;
    const modules = 'FIS';

    const result = await pool.query(
      'INSERT INTO fisuserversions (piva, remoteversion, currentversion, modules, os, licenza) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (piva, licenza) DO UPDATE SET remoteversion = $2, currentversion = $3, modules = $4, os = $5, licenza = $6  RETURNING *',
      [piva, remoteVersion, currentVersion, modules, os, licenseEnvironment]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});








//############################################################################################################################

// Route to get all releases
app.get('/releases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fisreleases');
    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to add a new release
app.post('/releases', async (req, res) => {
  const { version_number, release_date, description } = req.body;

  try {
    const result = await pool.query('INSERT INTO fisreleases (version_number, release_date, description) VALUES ($1, $2, $3) RETURNING *', [version_number, release_date, description]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to update a release
app.put('/releases/:id', async (req, res) => {
  const releaseId = req.params.id;
  const { version_number, release_date, description } = req.body;

  try {
    const result = await pool.query('UPDATE fisreleases SET version_number = $1, release_date = $2, description = $3 WHERE id = $4 RETURNING *', [version_number, release_date, description, releaseId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to delete a release
app.delete('/releases/:id', async (req, res) => {
  const releaseId = req.params.id;

  try {
    const result = await pool.query('DELETE FROM fisreleases WHERE id = $1 RETURNING *', [releaseId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
