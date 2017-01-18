cd $PSScriptRoot

$nodeVersion = "v6.9.2"
$nodeMsi = "node-" + $nodeVersion + "-x64.msi"
$whereNode = where.exe node

if ($whereNode -Like "*\node.exe")
{
  if (Test-Path $nodeMsi)
  {
    rm $nodeMsi
  }

  if (-Not (Test-Path node_modules))
  {
    echo "npm installing..."
    npm install -g bower
    npm install
  }

  $argList = $args[0]
  for ($i = 1; $i -lt $args.length; $++)
  {
    $argList = "$argList $args[$i]"
  }

  node_modules\.bin\gulp --gulpfile node_modules\fepper\tasker.js $argList
}
else
{
  iwr -o $nodeMsi https://nodejs.org/dist/$nodeVersion/$nodeMsi
  msiexec /i $nodeMsi
  echo "After Node.js has finished installing, restart your computer."
}

PAUSE
