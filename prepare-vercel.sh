#!/bin/bash
# Script de preparación para desplegar en Vercel

echo "🚀 Preparando para despliegue en Vercel..."
echo ""

# Verificar que estamos en la raíz del proyecto
if [ ! -f "vercel.json" ]; then
  echo "❌ Error: No se encontró vercel.json"
  echo "Ejecuta este script desde la raíz del proyecto"
  exit 1
fi

echo "✅ Estructura del proyecto verificada"
echo ""

# Verificar dependencias del frontend
echo "📦 Verificando dependencias del frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules no encontrado. Instalando dependencias..."
  npm install
fi

if [ ! -f ".env" ]; then
  echo "⚠️  .env no encontrado. Creando desde .env.example..."
  cp .env.example .env
  echo "⚠️  Por favor, actualiza .env con tus credenciales"
fi

echo "✅ Dependencias verificadas"
echo ""

# Verificar variables de entorno
echo "🔐 Verificando variables de entorno..."

missing_vars=()

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && ! grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env; then
  missing_vars+=("NEXT_PUBLIC_SUPABASE_URL")
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] && ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env; then
  missing_vars+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
fi

if [ -z "$GEMINI_API_KEY" ] && ! grep -q "GEMINI_API_KEY=" .env; then
  missing_vars+=("GEMINI_API_KEY")
fi

if [ -z "$SUPABASE_SERVICE_KEY" ] && ! grep -q "SUPABASE_SERVICE_KEY=" .env; then
  missing_vars+=("SUPABASE_SERVICE_KEY")
fi

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "⚠️  Faltan variables de entorno:"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "Por favor, configura estas variables en .env antes de desplegar"
else
  echo "✅ Todas las variables de entorno están configuradas"
fi

echo ""
echo "📝 Verificando build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build exitoso"
else
  echo "❌ Error en el build. Revisa los logs arriba"
  exit 1
fi

echo ""
echo "🎉 Preparación completada!"
echo ""
echo "Próximos pasos:"
echo "1. Verifica que todas las variables estén en .env"
echo "2. Push a GitHub: git push"
echo "3. Vercel desplegará automáticamente"
echo ""
echo "Para desplegar manualmente:"
echo "  vercel deploy --prod"
