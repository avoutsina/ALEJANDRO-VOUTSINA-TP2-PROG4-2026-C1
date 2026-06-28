async function run() {
  const formData = new FormData();
  formData.append('titulo', 'Titulo de prueba');
  formData.append('userId', '6a3fefdf48494a29df4458b5');
  formData.append('descripcion', 'Descripcion de prueba');
  formData.append('nombreUsuario', 'Alejandro');
  formData.append('avatar', 'http://example.com/avatar.png');

  try {
    const response = await fetch('http://localhost:3000/perfil/crear', {
      method: 'POST',
      body: formData,
      // Nota: Node.js 18+ configura automáticamente las cabeceras multipart/form-data con boundary cuando pasas un FormData nativo.
    });
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Body:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
