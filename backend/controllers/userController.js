const pool = require('../db/pool');

exports.newUser =  async (req, res) => {
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
};

