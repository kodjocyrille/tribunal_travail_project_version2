
$baseUri = "https://tribunal-travail.runasp.net/api/affaires/enroler/"
$headers = @{ "Content-Type" = "application/json" }

# Using clear string literals to avoid PowerShell escaping confusion
$nomDemandeur = "j`"'`""
$nomDefendeur = "j`"'ji(oi'("

$payload = @{
    natureLitige = "Autre"
    typeDossier = "INDIVIDUEL"
    observations = "Test Special Chars"
    dateRequete = "2026-02-16T00:00:00.000Z"
    dateArrivee = "2026-02-16T00:00:00.000Z"
    dateAudienceConciliation = "2026-02-16T00:00:00.000Z"
    typeAudience = "CONCILIATION_NORMALE"
    parties = @(
        @{
            nomComplet = $nomDemandeur
            typePersonne = "PHYSIQUE"
            typePartie = "DEMANDEUR"
            qualite = "Salarié"
            adresse = "Test Adr"
             nomEntite = ""
            numeroRccm = ""
            email = ""
            telephone = ""
            observations = ""
        },
        @{
            nomComplet = $nomDefendeur
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
    Write-Host "Special Chars Success"
    $response | ConvertTo-Json
} catch {
    Write-Host "Special Chars Failure"
    $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
    Write-Host "Error Details: $($reader.ReadToEnd())"
}
