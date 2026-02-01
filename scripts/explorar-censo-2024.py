#!/usr/bin/env python3
"""
Script para explorar la estructura del Censo 2024 sin convertir todo el archivo
Uso: python3 scripts/explorar-censo-2024.py
"""

import pandas as pd
import sys
from pathlib import Path

print("🔍 Explorando estructura del Censo 2024...\n")

# Ruta del archivo
parquet_path = Path("public/data/geo/Cartografia_censo2024_Pais_Comunal.parquet")

if not parquet_path.exists():
    print(f"❌ ERROR: No se encuentra el archivo {parquet_path}")
    sys.exit(1)

try:
    # Leer solo las primeras 100 filas para análisis rápido
    print(f"📖 Leyendo muestra de {parquet_path.name}...")
    df = pd.read_parquet(parquet_path, engine='pyarrow')
    
    print(f"✅ Archivo leído exitosamente\n")
    
    # Información general
    print("=" * 70)
    print("📊 INFORMACIÓN GENERAL")
    print("=" * 70)
    print(f"Total de registros: {len(df):,}")
    print(f"Total de columnas:  {len(df.columns)}")
    print(f"Memoria usada:      {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    print()
    
    # Listar todas las columnas
    print("=" * 70)
    print("📋 COLUMNAS DISPONIBLES")
    print("=" * 70)
    for i, col in enumerate(df.columns, 1):
        dtype = df[col].dtype
        non_null = df[col].count()
        null_pct = (len(df) - non_null) / len(df) * 100
        print(f"{i:3d}. {col:40s} | {str(dtype):15s} | {null_pct:5.1f}% nulos")
    print()
    
    # Buscar columnas relacionadas con códigos
    print("=" * 70)
    print("🔑 COLUMNAS DE CÓDIGOS/IDENTIFICADORES")
    print("=" * 70)
    codigo_cols = [col for col in df.columns if any(x in col.lower() for x in ['cod', 'id', 'geocod', 'uv'])]
    if codigo_cols:
        for col in codigo_cols:
            print(f"   • {col}")
            print(f"     Ejemplo: {df[col].iloc[0]}")
            print(f"     Únicos:  {df[col].nunique():,}")
            print()
    else:
        print("   ⚠️  No se encontraron columnas obvias de código")
        print("   Mostrando primeras 5 columnas:")
        for col in df.columns[:5]:
            print(f"   • {col}: {df[col].iloc[0]}")
    print()
    
    # Buscar columnas demográficas
    print("=" * 70)
    print("👥 COLUMNAS DEMOGRÁFICAS")
    print("=" * 70)
    demo_cols = [col for col in df.columns if any(x in col.lower() for x in ['persona', 'hogar', 'vivienda', 'poblacion', 'hombre', 'mujer'])]
    if demo_cols:
        for col in demo_cols:
            if pd.api.types.is_numeric_dtype(df[col]):
                print(f"   • {col}")
                print(f"     Total:   {df[col].sum():,}")
                print(f"     Promedio: {df[col].mean():.1f}")
                print(f"     Rango:   {df[col].min():,} - {df[col].max():,}")
                print()
    else:
        print("   ⚠️  No se encontraron columnas demográficas obvias")
    print()
    
    # Mostrar muestra de datos
    print("=" * 70)
    print("📄 MUESTRA DE DATOS (primeras 3 filas)")
    print("=" * 70)
    
    # Seleccionar columnas más relevantes para mostrar
    cols_to_show = []
    for keyword in ['cod', 'nombre', 'nom', 'persona', 'hogar', 'vivienda']:
        cols_to_show.extend([col for col in df.columns if keyword in col.lower()])
    
    # Eliminar duplicados manteniendo orden
    cols_to_show = list(dict.fromkeys(cols_to_show))
    
    if cols_to_show:
        print(df[cols_to_show[:10]].head(3).to_string())
    else:
        print(df.head(3).to_string())
    print()
    
    # Sugerencias para el script de actualización
    print("=" * 70)
    print("💡 SUGERENCIAS PARA ACTUALIZACIÓN")
    print("=" * 70)
    
    # Identificar columna de código
    codigo_sugerido = None
    for col in ['GEOCODIGO', 'COD_UV', 'CODIGO', 'ID_UV', 'geocodigo', 'codigo']:
        if col in df.columns:
            codigo_sugerido = col
            break
    
    if codigo_sugerido:
        print(f"✅ Campo de código sugerido: '{codigo_sugerido}'")
        print(f"   Ejemplo de valor: {df[codigo_sugerido].iloc[0]}")
    else:
        print("⚠️  No se identificó campo de código automáticamente")
        print("   Revisa las columnas listadas arriba")
    print()
    
    # Identificar campos demográficos
    print("📊 Campos demográficos sugeridos:")
    mapping = {
        'personas': ['TOTAL_PERSONAS', 'PERSONAS', 'POBLACION', 'POB_TOTAL'],
        'hogares': ['TOTAL_HOGARES', 'HOGARES', 'HOG_TOTAL'],
        'viviendas': ['TOTAL_VIVIENDAS', 'VIVIENDAS', 'VIV_TOTAL'],
        'hombres': ['HOMBRES', 'HOMB', 'MASCULINO'],
        'mujeres': ['MUJERES', 'MUJ', 'FEMENINO']
    }
    
    for campo, posibles in mapping.items():
        encontrado = None
        for posible in posibles:
            if posible in df.columns:
                encontrado = posible
                break
        
        if encontrado:
            print(f"   • {campo:12s} → '{encontrado}'")
        else:
            print(f"   • {campo:12s} → ⚠️  No encontrado")
    print()
    
    print("=" * 70)
    print("✅ Exploración completada")
    print("=" * 70)
    print()
    print("📋 PRÓXIMOS PASOS:")
    print("1. Anota los nombres de campos identificados arriba")
    print("2. Edita 'scripts/actualizar-datos-censo-2024.js'")
    print("3. Actualiza las líneas 48 y 70-80 con los nombres correctos")
    print("4. Ejecuta: python3 scripts/convertir-parquet-a-json.py")
    print("5. Ejecuta: node scripts/actualizar-datos-censo-2024.js")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
