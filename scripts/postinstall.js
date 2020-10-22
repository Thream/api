const fs = require('fs')

if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
  fs.copyFileSync('.env.example', '.env')
  console.log(
    '\x1b[36m%s\x1b[0m',
    'Successfully configured default ".env" file.'
  )
}
