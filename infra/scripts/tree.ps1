Get-ChildItem -Recurse -Directory |
  Where-Object { $_.FullName -notmatch '\\(node_modules|dist|\.next)(\\|$)' } |
  ForEach-Object { $_.FullName.Replace((Get-Location).Path, '').TrimStart('\') }
