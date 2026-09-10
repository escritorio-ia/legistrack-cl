# Regla de Revisión e Inspección en GitHub

Cuando el usuario pida "revisar", "revisa", "revisar online" o auditar el estado/código:
1. **Siempre referirse e inspeccionar el repositorio remoto en GitHub** (`https://github.com/escritorio-ia/legistrack-cl`), ramas remotas (`origin/main`), commits remotos y diferencias con GitHub, en lugar de limitarse solo a pruebas locales con navegador o servidor local.
2. Si hay cambios o correcciones locales que deben ser publicados en GitHub, preparar el commit y sincronizar o consultar antes de hacer push.
3. Verificar el estado del repositorio remoto con `git fetch origin`, comparar `git diff origin/main`, y verificar la sincronización con GitHub.
