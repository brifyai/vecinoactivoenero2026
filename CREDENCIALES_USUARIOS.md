# Credenciales de Usuarios Creados

## 🔐 Usuario Administrador

**Email**: `admin@vecinoactivo.cl`  
**Password**: `password`  
**Username**: `administrador`  
**URL**: `vecinoactivo.cl/administrador`

## 👥 Usuarios de Demostración

### María González
**Email**: `maria@vecinoactivo.cl`  
**Password**: `password`  
**Username**: `maria-gonzalez`  
**URL**: `vecinoactivo.cl/maria-gonzalez`

### Carlos Rodríguez
**Email**: `carlos@vecinoactivo.cl`  
**Password**: `password`  
**Username**: `carlos-rodriguez`  
**URL**: `vecinoactivo.cl/carlos-rodriguez`

### Ana Martínez
**Email**: `ana@vecinoactivo.cl`  
**Password**: `password`  
**Username**: `ana-martinez`  
**URL**: `vecinoactivo.cl/ana-martinez`

## 🔑 Información Técnica

- **Hash de Password**: `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`
- **Algoritmo**: bcrypt
- **Rounds**: 10
- **Password en texto plano**: `password`

## 🚀 Cómo Usar

1. **Para Login**: Usar email y password
2. **Para Perfiles**: Navegar a las URLs con username
3. **Para Testing**: Todos los usuarios tienen la misma contraseña por simplicidad

## ⚠️ Seguridad

- Estas son credenciales de **DESARROLLO/TESTING**
- En producción, cambiar todas las contraseñas
- El usuario administrador debe tener una contraseña segura
- Considerar implementar 2FA para el administrador

## 🔄 Cambiar Contraseñas

Para cambiar la contraseña de un usuario:
```sql
UPDATE public.users 
SET password = '$2a$10$NUEVO_HASH_AQUI' 
WHERE email = 'usuario@ejemplo.com';
```

Para generar un nuevo hash, usar herramientas como:
- bcrypt online generators
- Node.js: `bcrypt.hashSync('nueva_password', 10)`
- Python: `bcrypt.hashpw('nueva_password'.encode('utf-8'), bcrypt.gensalt())`