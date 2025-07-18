// Minimal test controller
const testController = {
  testFunction: (req, res) => {
    res.json({ message: 'Test successful' });
  }
};

module.exports = testController;
