const fs = require('fs').promises;
const path = require('path');

class JsonStorage {
  constructor(filePath, defaults = {}) {
    this.filePath = filePath;
    this.defaults = defaults;
  }

  async ensureFile() {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.access(this.filePath).catch(async () => {
        await fs.writeFile(this.filePath, JSON.stringify(this.defaults, null, 2), 'utf8');
      });
    } catch (error) {
      console.error(`Failed to ensure JSON storage file ${this.filePath}:`, error);
      throw error;
    }
  }

  async load() {
    try {
      await this.ensureFile();
      const content = await fs.readFile(this.filePath, 'utf8');
      if (!content) {
        return this.defaults;
      }
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load JSON storage ${this.filePath}:`, error);
      await this.save(this.defaults);
      return this.defaults;
    }
  }

  async save(data) {
    try {
      await this.ensureFile();
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      return data;
    } catch (error) {
      console.error(`Failed to save JSON storage ${this.filePath}:`, error);
      throw error;
    }
  }
}

module.exports = { JsonStorage };
