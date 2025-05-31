# ================================
# Create User Script
# ================================

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$true)]
    [string]$Nombre,
    
    [Parameter(Mandatory=$true)]
    [string]$Apellido,
    
    [string]$Telefono = "",
    
    [ValidateSet("admin", "gerente", "empleado")]
    [string]$Rol = "empleado",
    
    [string]$ApiUrl = "http://localhost:3000/graphql"
)

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "==================================" "Blue"
Write-ColorOutput "Oil Services Gateway - Create User" "Blue"
Write-ColorOutput "==================================" "Blue"
Write-Host ""

try {
    # Step 1: Login as admin to get token
    Write-ColorOutput "[INFO] Obteniendo token de autenticacion..." "Yellow"
    
    $loginMutation = @"
{
  "query": "mutation { login(loginInput: { email: \"admin@estacion.com\", password: \"admin123\" }) { access_token } }"
}
"@

    $loginResponse = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $loginMutation -ContentType "application/json"
    
    if (-not $loginResponse.data.login.access_token) {
        throw "No se pudo obtener el token de autenticacion"
    }
    
    $token = $loginResponse.data.login.access_token
    Write-ColorOutput "[SUCCESS] Token obtenido exitosamente" "Green"
    
    # Step 2: Get role ID
    Write-ColorOutput "[INFO] Obteniendo ID del rol '$Rol'..." "Yellow"
    
    $rolesQuery = @"
{
  "query": "query { roles { id nombre } }"
}
"@

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $rolesResponse = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $rolesQuery -Headers $headers
    $roleObj = $rolesResponse.data.roles | Where-Object { $_.nombre -eq $Rol }
    
    if (-not $roleObj) {
        throw "No se encontro el rol '$Rol'"
    }
    
    $roleId = $roleObj.id
    Write-ColorOutput "[SUCCESS] ID del rol obtenido: $roleId" "Green"
    
    # Step 3: Create user
    Write-ColorOutput "[INFO] Creando usuario '$Username'..." "Yellow"
    
    $createUserMutation = @"
{
  "query": "mutation { createUser(createUserInput: { email: \"$Email\", username: \"$Username\", password: \"$Password\", nombre: \"$Nombre\", apellido: \"$Apellido\", telefono: \"$Telefono\", rolId: \"$roleId\" }) { id email username nombre apellido rol { nombre } } }"
}
"@

    $userResponse = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $createUserMutation -Headers $headers
    
    if ($userResponse.errors) {
        throw "Error al crear usuario: $($userResponse.errors[0].message)"
    }
    
    $newUser = $userResponse.data.createUser
    
    Write-Host ""
    Write-ColorOutput "[SUCCESS] Usuario creado exitosamente!" "Green"
    Write-Host ""
    Write-ColorOutput "DETALLES DEL USUARIO:" "Yellow"
    Write-ColorOutput "  ID: $($newUser.id)" "Cyan"
    Write-ColorOutput "  Email: $($newUser.email)" "Cyan"
    Write-ColorOutput "  Username: $($newUser.username)" "Cyan"
    Write-ColorOutput "  Nombre: $($newUser.nombre) $($newUser.apellido)" "Cyan"
    Write-ColorOutput "  Rol: $($newUser.rol.nombre)" "Cyan"
    Write-Host ""
    Write-ColorOutput "El usuario puede ahora hacer login con:" "Yellow"
    Write-ColorOutput "  Email: $Email" "Magenta"
    Write-ColorOutput "  Password: $Password" "Magenta"
    
} catch {
    Write-ColorOutput "[ERROR] $($_.Exception.Message)" "Red"
    exit 1
} 