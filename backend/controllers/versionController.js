const pool = require('../db/pool');
const { compareVersions } = require('../utils/versionUtils');

exports.checkUpdateAvailable = async (req, res) => {
    const { piva, envLicense } = req.params;
    try {
        const result = await pool.query(
            'SELECT remoteVersion, currentVersion FROM fisuserversions WHERE PIVA = $1 AND licenza = $2',
            [piva, envLicense]
        );
        if (result.rows.length > 0) {
            const { remoteversion, currentversion } = result.rows[0];
            const updateAvailable = compareVersions(remoteversion, currentversion) > 0 ? remoteversion : "0";
            res.json({ updateAvailable });
        } else {
            res.status(404).json({ error: 'Remote version not found for the provided PIVA' });
        }
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


// Update the current version after installing it
exports.updateCurrentVersion =  async (req, res) => {
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
};

// Mark as installing the update
exports.markAsInstalling = async (req, res) => {
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
};


exports.canWeInstall =  async (req, res) => {
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
};


exports.updateRemoteVersions =  async (req, res) => {
    const selectedVersions = req.body;
    try {
        // Assuming your database has a method to update remote versions based on selected rows
        await updateRemoteVersions(selectedVersions);
        res.status(200).json({ message: 'Remote versions updated successfully' });
    } catch (error) {
        console.error('Error updating remote versions', error);
        res.status(500).json({ error: 'Internal server error', details: error });
    }
};

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

exports.getAllVersions = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fisuserversions');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};

// Define other methods like updateCurrentVersion, markAsInstalling, updateRemoteVersions, and getAllVersions here
