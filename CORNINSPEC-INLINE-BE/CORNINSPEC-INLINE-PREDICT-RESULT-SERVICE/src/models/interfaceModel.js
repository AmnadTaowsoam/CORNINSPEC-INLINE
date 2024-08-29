// models/interfaceModel.js
const { predictionPool } = require('../config/dbconfig');  // Ensure that dbPool.js configures and exports a PG pool correctly

// Create
const addInterface = async (inslot, material, batch, plant, operationno, phys0003, phys0004, phys0005, phys0006, phys0007, phys0008, phys0009) => {
  const query = `
    INSERT INTO prediction.interface (
      inslot, material, batch, plant, operationno,
      phys0003, phys0004, phys0005, phys0006, phys0007, phys0008, phys0009
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;
  `;
  const values = [inslot, material, batch, plant, operationno, phys0003, phys0004, phys0005, phys0006, phys0007, phys0008, phys0009];
  const { rows } = await predictionPool.query(query, values);
  return rows[0];
};

// Read
const getInterfaces = async () => {
  const { rows } = await predictionPool.query('SELECT * FROM prediction.interface');
  return rows;
};

const getInterfaceById = async (id) => {
  const { rows } = await predictionPool.query('SELECT * FROM prediction.interface WHERE id = $1', [id]);
  return rows[0]; // Ensuring consistency by returning a single interface object
};

// Update
const updateInterface = async (id, inslot, material, batch, plant, operationno, phys0003, phys0004, phys0005, phys0006, phys0007, phys0008, phys0009) => {
  const query = `
    UPDATE prediction.interface
    SET
      inslot = $2,
      material = $3,
      batch = $4,
      plant = $5,
      operationno = $6,
      phys0003 = $7,
      phys0004 = $8,
      phys0005 = $9,
      phys0006 = $10,
      phys0007 = $11,
      phys0008 = $12,
      phys0009 = $13,
      updated_at = NOW()
    WHERE id = $1 RETURNING *;
  `;
  const values = [id, inslot, material, batch, plant, operationno, phys0003, phys0004, phys0005, phys0006, phys0007, phys0008, phys0009];
  const { rows } = await predictionPool.query(query, values);
  return rows[0];
};


// Delete
const deleteInterface = async (id) => {
  await predictionPool.query('DELETE FROM prediction.interface WHERE id = $1', [id]);
};

async function getInterfacesByCriteria(inslot, batch, material, plant, operationno) {
  const query = `
      SELECT * FROM prediction.interface
      WHERE inslot = $1 AND batch = $2 AND material = $3 AND plant = $4 AND operationno = $5;
  `;
  const values = [inslot, batch, material, plant, operationno];
  const { rows } = await predictionPool.query(query, values);
  return rows;
}

module.exports = {
  addInterface,
  getInterfaces,
  getInterfaceById,
  updateInterface,
  deleteInterface,
  getInterfacesByCriteria
};
