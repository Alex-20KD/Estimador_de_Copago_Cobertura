#!/usr/bin/env python3
"""
Script para preparar el despliegue en Vercel
Verifica que todo esté configurado correctamente antes de desplegar
"""

import os
import sys
import json
from pathlib import Path

def check_file_exists(path, description):
    """Verifica si un archivo existe"""
    if Path(path).exists():
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description} - No encontrado: {path}")
        return False

def check_env_vars(env_file):
    """Verifica que las variables de entorno estén configuradas"""
    required_vars = [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "GEMINI_API_KEY",
        "SUPABASE_SERVICE_KEY"
    ]
    
    missing = []
    
    if not Path(env_file).exists():
        return required_vars, []
    
    with open(env_file, 'r') as f:
        env_content = f.read()
    
    for var in required_vars:
        if var not in env_content or "=" not in env_content[env_content.find(var):env_content.find(var)+100]:
            missing.append(var)
    
    return missing, [v for v in required_vars if v not in missing]

def main():
    print("🚀 Verificando configuración para Vercel...\n")
    
    project_root = Path(".")
    
    # Verificar archivos críticos
    print("📁 Verificando estructura del proyecto...")
    checks = [
        (project_root / "vercel.json", "vercel.json"),
        (project_root / "frontend" / "package.json", "Frontend package.json"),
        (project_root / "frontend" / "next.config.js", "Next.js config"),
        (project_root / "frontend" / "app" / "api" / "health" / "route.js", "Health endpoint"),
        (project_root / "frontend" / "app" / "api" / "analyze-symptom" / "route.js", "Analyze symptom endpoint"),
        (project_root / "frontend" / "app" / "api" / "estimate-copay" / "route.js", "Estimate copay endpoint"),
    ]
    
    all_files_ok = True
    for path, desc in checks:
        if not check_file_exists(path, f"  {desc}"):
            all_files_ok = False
    
    print()
    
    # Verificar variables de entorno
    print("🔐 Verificando variables de entorno...")
    env_path = "frontend/.env"
    
    missing_vars, configured_vars = check_env_vars(env_path)
    
    if missing_vars:
        print(f"\n⚠️  Variables de entorno faltantes:")
        for var in missing_vars:
            print(f"   - {var}")
        print(f"\nConfigura estas variables en {env_path}")
    else:
        print(f"✅ Todas las variables configuradas:")
        for var in configured_vars:
            print(f"   - {var}")
    
    print()
    
    # Verificar dependencias
    print("📦 Verificando dependencias...")
    package_json_path = "frontend/package.json"
    
    if Path(package_json_path).exists():
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        required_deps = {
            "@google/generative-ai": "Para clasificación de síntomas",
            "@supabase/supabase-js": "Para consultas a Supabase"
        }
        
        deps = package_data.get("dependencies", {})
        
        for dep, description in required_deps.items():
            if dep in deps:
                print(f"✅ {dep} - {description}")
            else:
                print(f"❌ {dep} - No encontrado en package.json")
    
    print()
    
    # Resumen
    print("=" * 60)
    print("📋 RESUMEN")
    print("=" * 60)
    
    if all_files_ok and not missing_vars:
        print("\n✅ ¡Listo para desplegar en Vercel!")
        print("\nPróximos pasos:")
        print("1. git add .")
        print("2. git commit -m 'Configure for Vercel deployment'")
        print("3. git push")
        print("4. Vercel desplegará automáticamente\n")
        return 0
    else:
        print("\n⚠️  Hay problemas que resolver antes de desplegar:")
        if not all_files_ok:
            print("   - Verifica que todos los archivos existan")
        if missing_vars:
            print(f"   - Configura las variables faltantes en {env_path}")
        print()
        return 1

if __name__ == "__main__":
    sys.exit(main())
