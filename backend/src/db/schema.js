// Creates the MySQL tables from the models (npm run db:setup) and adds the one
// foreign key that cannot be part of CREATE TABLE because two tables point at each
// other: restaurant_orders.billing_folioEntry -> reservation_folio.id.
import { sequelize } from '../config/db.js';
import '../models/index.js';

const LATE_FK = {
  table: 'restaurant_orders',
  field: 'billing_folioEntry',
  name: 'fk_orders_folio_entry',
  references: { table: 'reservation_folio', field: 'id' },
  onDelete: 'SET NULL',
};

export async function createSchema({ force = false } = {}) {
  const query = sequelize.getQueryInterface();
  const sqlite = sequelize.getDialect() === 'sqlite';
  // The cross link must go before the tables it joins are dropped.
  if (force && !sqlite) await query.removeConstraint(LATE_FK.table, LATE_FK.name).catch(() => {});
  await sequelize.sync({ force });
  // SQLite (used only by the tests) cannot add a constraint to an existing table.
  if (sqlite) return;
  const existing = await query.getForeignKeyReferencesForTable(LATE_FK.table);
  if (!existing.some((row) => row.columnName === LATE_FK.field)) {
    await query.addConstraint(LATE_FK.table, {
      fields: [LATE_FK.field],
      type: 'foreign key',
      name: LATE_FK.name,
      references: LATE_FK.references,
      onDelete: LATE_FK.onDelete,
      onUpdate: 'CASCADE',
    });
  }
}

export { LATE_FK };
