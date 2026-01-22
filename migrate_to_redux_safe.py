#!/usr/bin/env python3
"""
Safe migration script to replace useAuth() with Redux selectors
"""
import os
import re
from pathlib import Path

def migrate_file(filepath):
    """Migrate a single file to use Redux instead of useAuth"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        modified = False
        
        # Check if file uses useAuth
        if 'useAuth' not in content:
            return False
        
        # Skip if already using useReduxAuth
        if 'useReduxAuth' in content:
            print(f"  ⏭️  Already migrated: {filepath}")
            return False
        
        # Determine correct import path for selectors
        depth = str(filepath).count('/') - 1  # Count directory depth
        if '/components/' in str(filepath):
            selector_path = '../../store/selectors/authSelectors'
            hook_path = '../../hooks/useReduxAuth'
        elif '/pages/' in str(filepath):
            selector_path = '../store/selectors/authSelectors'
            hook_path = '../hooks/useReduxAuth'
        elif '/context/' in str(filepath):
            selector_path = '../store/selectors/authSelectors'
            hook_path = '../hooks/useReduxAuth'
        else:
            selector_path = './store/selectors/authSelectors'
            hook_path = './hooks/useReduxAuth'
        
        # Step 1: Replace import statement
        # Pattern: import { useAuth } from '../context/AuthContext';
        import_pattern = r"import\s*{\s*useAuth\s*}\s*from\s*['\"].*?AuthContext['\"];"
        if re.search(import_pattern, content):
            # Add Redux imports
            redux_imports = f"import {{ useSelector }} from 'react-redux';\nimport {{ selectUser }} from '{selector_path}';"
            content = re.sub(import_pattern, redux_imports, content)
            modified = True
        
        # Step 2: Replace useAuth() destructuring patterns
        # Pattern: const { user, login, logout, updateUser } = useAuth();
        useauth_pattern = r"const\s*{\s*([^}]+)\s*}\s*=\s*useAuth\(\);"
        matches = re.findall(useauth_pattern, content)
        
        if matches:
            for match in matches:
                vars_str = match.strip()
                vars_list = [v.strip() for v in vars_str.split(',')]
                
                # Check what variables are being destructured
                has_user = 'user' in vars_list
                has_functions = any(v in vars_list for v in ['login', 'logout', 'updateUser', 'register'])
                
                if has_user and has_functions:
                    # Need both selector and hook
                    replacement = f"const user = useSelector(selectUser);\n  const {{ {', '.join([v for v in vars_list if v != 'user'])} }} = useReduxAuth();"
                    content = re.sub(
                        rf"const\s*{{\s*{re.escape(vars_str)}\s*}}\s*=\s*useAuth\(\);",
                        replacement,
                        content
                    )
                    # Add useReduxAuth import if not present
                    if 'useReduxAuth' not in content:
                        content = content.replace(
                            f"import {{ selectUser }} from '{selector_path}';",
                            f"import {{ selectUser }} from '{selector_path}';\nimport {{ useReduxAuth }} from '{hook_path}';"
                        )
                elif has_user:
                    # Only need selector
                    replacement = "const user = useSelector(selectUser);"
                    content = re.sub(
                        rf"const\s*{{\s*{re.escape(vars_str)}\s*}}\s*=\s*useAuth\(\);",
                        replacement,
                        content
                    )
                else:
                    # Only need functions
                    replacement = f"const {{ {vars_str} }} = useReduxAuth();"
                    content = re.sub(
                        rf"const\s*{{\s*{re.escape(vars_str)}\s*}}\s*=\s*useAuth\(\);",
                        replacement,
                        content
                    )
                    # Add useReduxAuth import
                    if 'useReduxAuth' not in content:
                        content = content.replace(
                            f"import {{ selectUser }} from '{selector_path}';",
                            f"import {{ selectUser }} from '{selector_path}';\nimport {{ useReduxAuth }} from '{hook_path}';"
                        )
                
                modified = True
        
        # Step 3: Replace simple useAuth() calls
        # Pattern: const user = useAuth();
        simple_pattern = r"const\s+(\w+)\s*=\s*useAuth\(\);"
        if re.search(simple_pattern, content):
            content = re.sub(simple_pattern, r"const \1 = useSelector(selectUser);", content)
            modified = True
        
        # Only write if modified
        if modified and content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✅ Migrated: {filepath}")
            return True
        
        return False
        
    except Exception as e:
        print(f"  ❌ Error in {filepath}: {e}")
        return False

def main():
    """Main migration function"""
    print("🚀 Starting safe Redux migration...\n")
    
    # Find all JS files in src/
    src_dir = Path('src')
    js_files = list(src_dir.rglob('*.js'))
    
    # Filter out test files and node_modules
    js_files = [f for f in js_files if 'node_modules' not in str(f) and not str(f).endswith('.test.js')]
    
    print(f"📁 Found {len(js_files)} JavaScript files\n")
    
    migrated_count = 0
    for filepath in sorted(js_files):
        if migrate_file(filepath):
            migrated_count += 1
    
    print(f"\n✨ Migration complete!")
    print(f"📊 Migrated {migrated_count} files")

if __name__ == '__main__':
    main()
