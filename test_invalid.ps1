
$baseUri = "https://tribunal-travail.runasp.net/api/affaires/enroler/"
$headers = @{ "Content-Type" = "application/json" }

$payload = @{
    natureLitige = "Autre"
    typeDossier = "INDIVIDUEL"
    observations = "Test Invalid"
    dateRequete = "2026-02-16"
    dateArrivee = "2026-02-16"
    dateAudienceConciliation = "2026-02-16"
    typeAudience = "CONCILIATION_NORMALE"
    parties = @(
        @{
            nomComplet = "Test Dem"
            typePersonne = "PHYSIQUE"
            typePartie = "INVALID_VALUE"  # This should fail
            qualite = "Salarié"
            adresse = "Test Adr"
             nomEntite = ""
            numeroRccm = ""
            email = ""
            telephone = ""
            observations = ""
        },
        @{
            nomComplet = "Test Def"
            typePersonne = "PHYSIQUE"
            typePartie = "DEFENDEUR"
            qualite = "Employeur"
            adresse = "Test Adr"
             nomEntite = ""
            numeroRccm = ""
            email = ""
            telephone = ""
            observations = ""
        }
    )
    documents = @()
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri $baseUri -Method Post -Headers $headers -Body $payload
    Write-Host "Unexpected Success"
    $response | ConvertTo-Json
} catch {
    Write-Host "Expected Failure"
    $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
    Write-Host "Error Details: $($reader.ReadToEnd())"
}
