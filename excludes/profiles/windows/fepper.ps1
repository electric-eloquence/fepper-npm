cd $PSScriptRoot

$nodeVersion = "v7.6.0"
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
  echo "You must install Node.js to continue. After it has finished installing, restart your computer."
}

PAUSE
