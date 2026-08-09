# Démarre la base de données PostgreSQL locale de TekBoutik.
# Double-cliquez sur ce fichier (ou clic droit > Exécuter avec PowerShell)
# avant de lancer "npm run dev" si le site n'arrive pas à se connecter.

$dataDir = "C:\Users\billy bob\pgdata-tekboutik"
$logFile = "$dataDir\server.log"

& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" -D $dataDir -l $logFile -o "-p 5433" start

Write-Host ""
Write-Host "Base de donnees TekBoutik demarree (ou deja active)." -ForegroundColor Green
Write-Host "Vous pouvez fermer cette fenetre."
Read-Host "Appuyez sur Entree pour fermer"
