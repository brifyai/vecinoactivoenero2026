#!/usr/bin/env python3
"""
Script para convertir archivo Parquet del Censo 2024 a JSON
Uso: python3 scripts/convertir-parquet-a-json.py
"""

import pandas as pd
import json
import sys
from pathlib import Path

print("🔄 Convirtiendo Parquet del Censo 2024 a JSON...\n")

# Rutas
parquet_path = Path("public/data/geo/Cartografia_censo2024_Pais_Comunal.parquet")
json_path = Path("public/data/geo/censo2024_comunal.json")

# Verificar que existe el archivo
if not parquet_path.exists():
    print(f"❌ ERROR: No se encuentra el archivo {parquet_path}")
    sys.exit(1)

try:
    # Leer Parquet
    print(f"📖 Leyendo {parquet_path.name}...")
    df = pd.read_parquet(parquet_path)
    
    print(f"✅ Archivo leído: {len(df)} registros, {len(df.columns)} columnas\n")
    
    # Mostrar primeras columnas para referencia
    print("📋 Columnas disponibles:")
    for i, col in enumerate(df.columns[:20], 1):
        print(f"   {i}. {col}")
    if len(df.columns) > 20:
        print(f"   ... y {len(df.columns) - 20} columnas más")
    print()
    
    # Mostrar muestra de datos
    print("📊 Muestra de datos (primeras 3 filas):")
    print(df.head(3).to_string())
    print()
    
    # Convertir a JSON
    print(f"💾 Guardando en {json_path.name}...")
    
    # Eliminar columna geometry (no la necesitamos, ya tenemos geometrías en la BD)
    if 'geometry' in df.columns:
        print("   ⚠️  Eliminando columna 'geometry' (no necesaria, ya tenemos geometrías)")
        df = df.drop(columns=['geometry'])
    
    # Eliminar otras columnas binarias problemáticas
    binary_cols = []
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                # Intentar convertir a string
                df[col] = df[col].astype(str)
            except:
                binary_cols.append(col)
    
    if binary_cols:
        print(f"   ⚠️  Eliminando columnas binarias: {', '.join(binary_cols)}")
        df = df.drop(columns=binary_cols)
    
    # Guardar como JSON
    df.to_json(json_path, orient='records', force_ascii=False, indent=2)
    
    # Verificar tamaño del archivo
    size_mb = json_path.stat().st_size / (1024 * 1024)
    
    print(f"✅ Conversión completada")
    print(f"📁 Archivo guardado: {json_path}")
    print(f"📊 Tamaño: {size_mb:.2f} MB")
    print(f"📈 Registros: {len(df)}")
    print()
    print("✅ Ahora puedes ejecutar: node scripts/actualizar-datos-censo-2024.js")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    sys.exit(1)
