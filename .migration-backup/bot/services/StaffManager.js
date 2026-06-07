const staffStore = require('../storage/StaffStore');

class StaffManager {
  constructor() {
    this.staff = { managers: [], assistants: [], staffAudit: [] };
  }

  async initialize() {
    this.staff = await staffStore.load();
  }

  async validateStaff() {
    const errors = [];
    if (!Array.isArray(this.staff.managers)) {
      errors.push('Staff managers must be an array');
    }
    if (!Array.isArray(this.staff.assistants)) {
      errors.push('Staff assistants must be an array');
    }
    return errors;
  }

  async syncStaff() {
    await staffStore.save(this.staff);
  }

  recordStaffAudit(entry) {
    this.staff.staffAudit = this.staff.staffAudit || [];
    this.staff.staffAudit.unshift({ ...entry, timestamp: new Date().toISOString() });
    this.staff.staffAudit = this.staff.staffAudit.slice(0, 100);
  }
}

module.exports = StaffManager;
