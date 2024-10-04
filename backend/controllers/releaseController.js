const pool = require('../db/pool');

exports.getAllReleases = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fisreleases');
        res.json(result.rows);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


// Route to add a new release
 exports.addRelease = async (req, res) => {
    const { version_number, release_date, description } = req.body;

    try {
        const result = await pool.query('INSERT INTO fisreleases (version_number, release_date, description) VALUES ($1, $2, $3) RETURNING *', [version_number, release_date, description]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};


// Route to update a release
 exports.updateRelease = async (req, res) => {
    const releaseId = req.params.id;
    const { version_number, release_date, description } = req.body;

    try {
        const result = await pool.query('UPDATE fisreleases SET version_number = $1, release_date = $2, description = $3 WHERE id = $4 RETURNING *', [version_number, release_date, description, releaseId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};

// Route to delete a release
exports.deleteRelease =  async (req, res) => {
    const releaseId = req.params.id;
    try {
        const result = await pool.query('DELETE FROM fisreleases WHERE id = $1 RETURNING *', [releaseId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).send('Internal Server Error');
    }
};
