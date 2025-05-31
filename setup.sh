#!/bin/bash

# 🚗 Oil Services Gateway - Script de Configuración Inicial
echo "🚗 Oil Services Gateway - Configuración Inicial"
echo "================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
check_prerequisites() {
    print_status "Verificando prerrequisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js v18 o superior."
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está disponible."
        exit 1
    fi
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker."
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado."
        exit 1
    fi
    
    print_success "Todos los prerrequisitos están instalados."
}

# Instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_success "Dependencias instaladas correctamente."
    else
        print_error "Error al instalar dependencias."
        exit 1
    fi
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    if [ ! -f .env ]; then
        cat > .env << EOL
# Base de datos PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/estacion_servicio_db?schema=public"

# JWT Configuration
JWT_SECRET="tu-jwt-secret-super-seguro-aqui-cambiar-en-produccion"
JWT_EXPIRES_IN="1d"

# Puerto de la aplicación
PORT=3000

# Configuración del entorno
NODE_ENV="development"

# GraphQL Playground (solo para desarrollo)
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
EOL
        print_success "Archivo .env creado."
    else
        print_warning "El archivo .env ya existe. No se modificó."
    fi
}

# Iniciar servicios de Docker
start_docker_services() {
    print_status "Iniciando servicios de Docker..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Servicios de Docker iniciados."
        print_status "Esperando que la base de datos esté lista..."
        sleep 10
    else
        print_error "Error al iniciar servicios de Docker."
        exit 1
    fi
}

# Configurar base de datos
setup_database() {
    print_status "Configurando base de datos..."
    
    # Generar cliente de Prisma
    print_status "Generando cliente de Prisma..."
    npm run prisma:generate
    
    # Ejecutar migraciones
    print_status "Ejecutando migraciones..."
    npm run prisma:migrate
    
    # Ejecutar seed
    print_status "Poblando base de datos con datos iniciales..."
    npm run prisma:seed
    
    if [ $? -eq 0 ]; then
        print_success "Base de datos configurada correctamente."
    else
        print_error "Error al configurar la base de datos."
        exit 1
    fi
}

# Mostrar información final
show_final_info() {
    echo ""
    echo "🎉 ¡Configuración completada exitosamente!"
    echo "========================================="
    echo ""
    echo "Para iniciar la aplicación:"
    echo "  npm run start:dev"
    echo ""
    echo "Accesos disponibles:"
    echo "  🌐 GraphQL Playground: http://localhost:3000/graphql"
    echo "  🗄️  PgAdmin: http://localhost:5050"
    echo "      - Usuario: admin@estacion.com"
    echo "      - Contraseña: admin123"
    echo ""
    echo "Usuario administrador por defecto:"
    echo "  📧 Email: admin@estacion.com"
    echo "  🔑 Contraseña: admin123"
    echo ""
    echo "Comandos útiles:"
    echo "  npm run docker:up       # Iniciar servicios Docker"
    echo "  npm run docker:down     # Detener servicios Docker"
    echo "  npm run prisma:studio   # Abrir Prisma Studio"
    echo "  npm run start:dev       # Iniciar aplicación en desarrollo"
    echo ""
}

# Ejecutar configuración
main() {
    check_prerequisites
    install_dependencies
    setup_environment
    start_docker_services
    setup_database
    show_final_info
}

# Ejecutar función principal
main 