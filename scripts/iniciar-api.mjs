import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const windows = process.platform === 'win32';
const env = { ...process.env };
const jdk21 = 'C:\\Program Files\\Java\\jdk-21';
if (windows && !env.JAVA_HOME && existsSync(jdk21)) env.JAVA_HOME = jdk21;
const processo = spawn(windows ? 'mvnw.cmd' : 'sh', windows
  ? ['--batch-mode', '--no-transfer-progress', 'spring-boot:run']
  : ['./mvnw', '--batch-mode', '--no-transfer-progress', 'spring-boot:run'], {
  cwd: fileURLToPath(new URL('../api', import.meta.url)), env, stdio: 'inherit', shell: windows,
});
processo.on('error', (erro) => { console.error('Não foi possível iniciar a API:', erro.message); process.exitCode = 1; });
processo.on('exit', (codigo) => { process.exitCode = codigo ?? 1; });
