
$baseUri = "https://tribunal-travail.runasp.net/api/affaires/enroler/"
$headers = @{ "Content-Type" = "application/json" }

function Test-Payload {
    param($typePartie1, $typePartie2, $typePersonne, $desc)
    Write-Host "Testing: $desc"
    
    $body = @{
        natureLitige = "Autre"
        typeDossier = "INDIVIDUEL"
        observations = "Test"
        dateRequete = "2026-02-16T00:00:00.000Z"
        dateArrivee = "2026-02-16T00:00:00.000Z"
        dateAudienceConciliation = "2026-02-16T00:00:00.000Z"
        typeAudience = "CONCILIATION_NORMALE"
        parties = @(
            @{
                nomComplet = "Test Dem"
                typePersonne = $typePersonne
                typePartie = $typePartie1
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
                typePersonne = $typePersonne
                typePartie = $typePartie2
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
        $response = Invoke-RestMethod -Uri $baseUri -Method Post -Headers $headers -Body $body
        Write-Host "SUCCESS ($desc): $($response | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        $errDetails = ""
        try {
            $reader = New-Object System.IO.StreamReader $_.Exception.Response.GetResponseStream()
            $errDetails = $reader.ReadToEnd()
        } catch {}
        Write-Host "FAILED ($desc): $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Details: $errDetails" -ForegroundColor Yellow
    }
}

Test-Payload "DEMANDEUR" "DEFENDEUR" "PHYSIQUE" "Uppercase (Current)"
Test-Payload "Demandeur" "Defendeur" "Physique" "PascalCase (Old)"
Test-Payload "demandeur" "defendeur" "physique" "Lowercase"
Test-Payload 0 1 0 "Integers (Enum?)"
Test-Payload "DEMANDEUR" "DEFENDEUR" "Physique" "Uppercase Partie, Pascal Personne"
