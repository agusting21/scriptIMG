const fs = require('fs');

// Función para buscar enlaces y guardar los hrefs
function findAndSaveLinks(filePath, outputFilePath) {
    // Expresión regular para buscar el patrón de un enlace HTML
    const linkRegex = /<a\s+class=\\"product-item-link\\"[^>]*href=\\"([^\\"]*)\\"[^>]*>/g;

    // Leer el archivo de texto
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        // Encontrar todos los enlaces coincidentes en el texto
        let match;
        const links = [];
        while ((match = linkRegex.exec(data)) !== null) {
            const href = match[1]; // Obtener el valor del atributo href
            links.push(href);
        }

        // Guardar los enlaces encontrados en un archivo de salida
        fs.writeFile(outputFilePath, links.join('\n'), 'utf8', (err) => {
            if (err) {
                console.error('Error writing the output file:', err);
                return;
            }
            console.log('Links have been saved to ' + outputFilePath);
        });
    });
}

// Llamada a la función con la ruta del archivo de entrada y el archivo de salida
findAndSaveLinks('./lista2.txt', 'output_links1.txt');