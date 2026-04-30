const { spawn, spawnSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function run(command, args) {
  rl.close();
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

function commandExists(command) {
  const lookup = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(lookup, [command], { stdio: 'ignore', shell: process.platform === 'win32' });
  return result.status === 0;
}

function hasAndroidSdk() {
  return Boolean(process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT) && commandExists('adb');
}

async function main() {
  console.log('\nHow do you want to open Notes?\n');
  console.log('1. Expo Go - fastest for previewing JavaScript changes');
  console.log('2. Native CLI/dev build - closer to production Android/iOS builds\n');

  const mode = await ask('Choose 1 or 2: ');

  if (mode === '1') {
    run('npm', ['run', 'start:expo']);
    return;
  }

  if (mode === '2') {
    console.log('\nNative target:\n');
    console.log('1. Android');
    console.log('2. iOS\n');

    const platform = await ask('Choose 1 or 2: ');

    if (platform === '1') {
      if (!hasAndroidSdk()) {
        console.log('\nAndroid native builds need Android Studio SDK tools and adb.');
        console.log('Install Android Studio, then set ANDROID_HOME to your SDK folder.');
        console.log('Common Windows SDK path: C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk');
        console.log('\nStarting Expo Go instead so you can keep working now.\n');
        run('npm', ['run', 'start:expo']);
        return;
      }

      run('npm', ['run', 'android:cli']);
      return;
    }

    if (platform === '2') {
      if (process.platform !== 'darwin') {
        console.log('\niOS native CLI builds require macOS with Xcode.');
        console.log('On Windows, use Expo Go for local preview or EAS Build for an iOS cloud build.');
        console.log('\nStarting Expo Go instead so you can keep working now.\n');
        run('npm', ['run', 'start:expo']);
        return;
      }

      run('npm', ['run', 'ios:cli']);
      return;
    }
  }

  console.log('\nNo valid option selected. Run `npm run open` to try again.');
  rl.close();
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
});
