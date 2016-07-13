const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = ({ srcDir, demoDir, demoEntry }) => ({
  context: srcDir,
  entry: demoEntry,
  output: {
    path: demoDir,
    filename: 'app.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: srcDir,
        loader: 'babel'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'Linux In-the-Browser Demo' })
  ]
});
