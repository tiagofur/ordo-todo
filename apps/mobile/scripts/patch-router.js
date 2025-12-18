const fs = require('fs');
const path = require('path');

console.log('Current __dirname:', __dirname);

const rootNodeModules = path.resolve(__dirname, '../../../node_modules');
const localNodeModules = path.resolve(__dirname, '../node_modules'); // Correct local path

console.log('Checking root:', rootNodeModules);
console.log('Checking local:', localNodeModules);

console.log('Root exists:', fs.existsSync(rootNodeModules));
console.log('Local exists:', fs.existsSync(localNodeModules));

let routerPath = path.resolve(rootNodeModules, 'expo-router');
if (!fs.existsSync(routerPath)) {
    console.log('Not at root.');
    routerPath = path.resolve(localNodeModules, 'expo-router');
}

if (!fs.existsSync(routerPath)) {
    console.log('Expo Router not found at:', routerPath);
    console.log('Checking dir content of root node_modules...');
    try {
        const files = fs.readdirSync(rootNodeModules);
        console.log('Found packages starting with expo-:', files.filter(f => f.startsWith('expo-')));
    } catch (e) { console.log('Could not read root node_modules'); }
    process.exit(1);
}

const files = ['_ctx.android.js', '_ctx.ios.js', '_ctx.web.js', '_ctx.js'];

files.forEach(file => {
  const filePath = path.join(routerPath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('require.context(')) {
      console.log(`Patching ${file}...`);
      
      // Determine relative path based on where expo-router is located
      const isLocal = routerPath.includes('apps' + path.sep + 'mobile');
      const appRoot = isLocal ? '../../app' : '../../apps/mobile/app';
      
      // Regex to match the require.context call and its arguments
      // We replace the entire call to ensure both APP_ROOT and IMPORT_MODE are fixed
      content = content.replace(
        /require\.context\([^,]+,\s*true,\s*\/\. \*\/\s*(?:,\s*[^)]+)?\)/,
        `require.context(${JSON.stringify(appRoot)}, true, /\. *\//, ${JSON.stringify('sync')})`
      );
      
      fs.writeFileSync(filePath, content);
    } else {
        console.log(`${file} already patched or env var not found.`);
    }
  }
});

console.log('Expo Router patched successfully');
