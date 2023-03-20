window.addEventListener("load", function (event) {
    $('#chkFormatoPropietario').prop('checked', false);
    $('#chkFormatoOriginal').prop('checked', false);
});

function mostrarSubirFile() {
    if ($('#chkFormatoPropietario').is(':checked') || $('#chkFormatoOriginal').is(':checked')) {
        if ($('#chkFormatoPropietario').is(':checked')) 
        {
            $("#lblSubidaFile").text("Seleccione uno o varios archivos XML que quiera convertir a formato propietario:");
        } else {
            $("#lblSubidaFile").text("Seleccione uno o varios archivos XML que quiera convertir a formato original:");
        }

        $("#panelSubidaFile").show(1000);
    } else {
        $("#panelSubidaFile").hide("slow");
    }
}

function uploadXML() {
    if ($('#chkFormatoPropietario').is(':checked') || $('#chkFormatoOriginal').is(':checked')) {

        let valido = archivosValidos(document.getElementById('inputXML').files);

        if (!valido) 
        {
            alert("No se han seleccionado uno o varios archivos de tipo XML!");
            document.getElementById('inputXML').value = "";
            $("#divboton").hide("slow");
        } else {
            $("#divboton").show(1000);
        }

    } else {
        alert("No se ha seleccionado ninguna acción a realizar!");
    }
}

function archivosValidos(files) {
    let valido = true;

    for (var i = 0; i < files.length; i++) {
        var file = document.getElementById('inputXML').files[i];
        var extension = (/[.]/.exec(file.name)) ? /[^.]+$/.exec(file.name)[0].toLowerCase() : undefined;

        if (extension != "xml") {
            valido = false;
            break;
        }
    };

    return valido;
}

function convertirXML() {

    let formato = "";
    let files = document.getElementById('inputXML').files;

    if ($('#chkFormatoPropietario').is(':checked')) {
        formato = "a_propietario";
    } else if ($('#chkFormatoOriginal').is(':checked')) {
        formato = "a_original";
    }

    try 
    {
        readXML(files).then(files => 
        {
            let xmls = [];

            for (let file of files) {
                var parser = new DOMParser();
                doc = parser.parseFromString(file, "application/xml");
                xmls.push(doc);
            }

            if (xmls.length > 0) 
            {
                switch (formato) 
                {
                    case "a_propietario":
                        try 
                        {
                            var parser = new DOMParser();
                            var xsl = parser.parseFromString(xslRef, "application/xml");
                            
                            var xmlPropietarios = [];
                            xmls.forEach((xml) => 
                            {
                                const xsltProcessor = new XSLTProcessor();
                                try 
                                {
                                    xsltProcessor.importStylesheet(xsl);

                                    try {
                                        const fragment = xsltProcessor.transformToFragment(xml, document);
                                        xmlPropietarios.push(fragment);
                                    } catch {
                                        alert("Error generando el archivo XML propietario");
                                    }

                                } catch {
                                    alert("Error usando el archivo XSLT para la transformación del XML origen");
                                }
                            });

                            var xmlResultado = xmlPropietarios[0];    //se añaden todos los nodos prediccion al primer xml

                            for(var i = 1;i<xmlPropietarios.length;i++)
                            {
                                xmlResultado.childNodes[0].appendChild(xmlPropietarios[i].childNodes[0].childNodes[0]);
                            }

                            let div=document.createElement("div");
                            div.appendChild(xmlResultado);
                            div.innerHTML;

                            descargarXML("predicciones_"+Date.now().toString()+".xml", div.innerHTML);

                        } catch {
                            alert("Error encontrando el archivo XSLT de transformación del XML origen");
                        }

                        break;

                    case "a_original":
   
                        var xmlPredicciones = [];

                        var parser = new DOMParser();
                        var publicXML = parser.parseFromString(
                            '<?xml version="1.0" encoding="ISO-8859-15"?>'+
                                '<root xmlns:xsd="https://www.w3.org/2001/XMLSchema" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" id="03014" version="1.0" xsi:noNamespaceSchemaLocation="https://www.aemet.es/xsd/localidades.xsd">'+
                                '</root>'
                            ,'application/xml');

                        var origenNode = publicXML.createElement("origen");
                        
                        productor = publicXML.createElement("productor")
                        productor.textContent = "Agencia Estatal de Meteorologiaa - AEMET. Gobierno de Espana"
                        origenNode.appendChild(productor);

                        web = publicXML.createElement("web")
                        web.textContent = "https://www.aemet.es"
                        origenNode.appendChild(web);

                        enlace = publicXML.createElement("enlace")
                        enlace.textContent = "https://www.aemet.es/es/eltiempo/prediccion/municipios"
                        origenNode.appendChild(enlace);

                        lenguaje = publicXML.createElement("lenguaje")
                        lenguaje.textContent = "es"
                        origenNode.appendChild(lenguaje);

                        copyright = publicXML.createElement("copyright")
                        copyright.textContent = "� AEMET. Autorizado el uso de la informaci�n y su reproducci�n citando a AEMET como autora de la misma."
                        origenNode.appendChild(copyright);

                        nota_legal = publicXML.createElement("nota_legal")
                        nota_legal.textContent = "https://www.aemet.es/es/nota_legal"
                        origenNode.appendChild(nota_legal);

                        var prediccionesNode = publicXML.createElement("predicciones")

                        xmls.forEach((xmlDoc) => 
                        {
                            var prediccionesProprietaryNode = xmlDoc.getElementsByTagName('predicciones');
                            
                            if(prediccionesProprietaryNode.length > 0)
                            {
                                var prediccionesProprietaryNode = xmlDoc.getElementsByTagName('prediccion');

                                for (var i = 0; i < prediccionesProprietaryNode.length; i++) 
                                {
                                    var prediccionProprietaryNode = prediccionesProprietaryNode[i];
                                    var prediccionNode = publicXML.createElement("prediccion")

                                    // Get all elements from prediccion node
                                    const elements = prediccionProprietaryNode.getElementsByTagName("*");

                                    // Loop through each element node
                                    for (let i = 0; i < elements.length; i++) 
                                    {
                                        var dia;
                                        var periodo;
                                        var viento;
                                        var temperatura;
                                        var sens_termica;
                                        var humedad_relativa;
                                        var datoType;

                                        switch(elements[i].tagName)
                                        {
                                            case "realizada":
                                                elaborado = publicXML.createElement("elaborado")
                                                elaborado.textContent = elements[i].textContent
                                                prediccionNode.appendChild(elaborado);
                                                break;

                                            case "nombre":
                                                nombre = publicXML.createElement("nombre")
                                                nombre.textContent = elements[i].textContent
                                                prediccionNode.appendChild(nombre);
                                                break;

                                            case "provincia":
                                                provincia = publicXML.createElement("provincia")
                                                provincia.textContent = elements[i].textContent
                                                prediccionNode.appendChild(provincia);
                                                break;

                                            case "dia":
                                                diaNode = publicXML.createElement("dia");
                                                diaNode.setAttribute("fecha", elements[i].getAttribute('fecha'))
                                                dia = diaNode;
                                                prediccionNode.appendChild(diaNode);
                                                break;

                                            case "periodo":
                                                periodo = elements[i].getAttribute('intervalo')
                                                break;
                                            
                                            case "precipitaciones":
                                                prob_precipitacion = publicXML.createElement("prob_precipitacion")
                                                prob_precipitacion.textContent = elements[i].textContent
                                                prob_precipitacion.setAttribute("periodo", periodo)
                                                dia.appendChild(prob_precipitacion)
                                                break;

                                            case "nieve":
                                                cota_nieve_prov = publicXML.createElement("cota_nieve_prov")
                                                cota_nieve_prov.textContent = elements[i].textContent
                                                cota_nieve_prov.setAttribute("periodo", periodo)
                                                dia.appendChild(cota_nieve_prov)
                                                break;

                                            case "cielo":
                                                estado_cielo = publicXML.createElement("estado_cielo")
                                                estado_cielo.textContent = elements[i].textContent
                                                estado_cielo.setAttribute("periodo", periodo)
                                                estado_cielo.setAttribute("descripcion", elements[i].getAttribute('estado'))
                                                dia.appendChild(estado_cielo)
                                                break;

                                            case "viento":
                                                vientoNode = publicXML.createElement("viento")
                                                vientoNode.setAttribute("periodo", periodo)
                                                viento = vientoNode;
                                                dia.appendChild(vientoNode)
                                                break;

                                            case "direccion":
                                                direccionNode = publicXML.createElement("direccion")
                                                direccionNode.textContent = elements[i].textContent
                                                viento.appendChild(direccionNode)
                                                break;

                                            case "velocidad":
                                                velocidadNode = publicXML.createElement("velocidad")
                                                velocidadNode.textContent = elements[i].textContent
                                                viento.appendChild(velocidadNode)
                                                break;

                                            case "dato":
                                                var dato = elements[i].getAttribute("valor")
                                                if(dato == "temperatura")
                                                {
                                                    temperaturaNode = publicXML.createElement("temperatura")
                                                    temperatura = temperaturaNode;
                                                    datoType = temperaturaNode;
                                                    dia.appendChild(temperaturaNode)
                                                    break;
                                                }
                                                if(dato == "sens_termica")
                                                {
                                                    sens_termicaNode = publicXML.createElement("sens_termica")
                                                    sens_termica = sens_termicaNode;
                                                    datoType = sens_termicaNode;
                                                    dia.appendChild(sens_termicaNode)
                                                    break;
                                                }
                                                if(dato == "humedad_relativa")
                                                {
                                                    humedad_relativaNode = publicXML.createElement("humedad_relativa")
                                                    humedad_relativa = humedad_relativaNode;
                                                    datoType = humedad_relativaNode;
                                                    dia.appendChild(humedad_relativaNode)
                                                    break;
                                                }
                                                
                                            case "max":
                                                maxima = publicXML.createElement("maxima")
                                                maxima.textContent = elements[i].textContent
                                                datoType.appendChild(maxima)
                                                break;

                                            case "min":
                                                minima = publicXML.createElement("minima")
                                                minima.textContent = elements[i].textContent
                                                datoType.appendChild(minima)
                                                break;

                                            case "hora":
                                                dato = publicXML.createElement("dato")
                                                dato.textContent = elements[i].textContent
                                                dato.setAttribute('hora', elements[i].getAttribute('valor'))
                                                datoType.appendChild(dato)
                                                break;

                                            case "uvmax":
                                                uv_max = publicXML.createElement("uv_max")
                                                uv_max.textContent = elements[i].textContent
                                                dia.appendChild(uv_max)
                                                break;
                                        }

                                        //Append each prediccion into predicciones node
                                        prediccionesNode.appendChild(prediccionNode)
                                    }
                                }

                                // Serialize the public XML document to a string
                                var serializer = new XMLSerializer();
                                var publicXmlString = serializer.serializeToString(publicXML);

                                console.log(publicXmlString)

                                // Append the predicciones node to the root element of the public XML document
                                publicXML.getElementsByTagName("root")[0].appendChild(origenNode)
                                publicXML.getElementsByTagName("root")[0].appendChild(prediccionesNode)
                            }
                            else{
                                alert("Uno o más archivos xml no son de tipo propietario")
                            }
                        });

                        descargarXML("prediccionesPublic_"+Date.now().toString()+".xml",publicXmlString)
                    
                    break;
                }
            } else {
                alert("No se ha adjuntado ningún xml válido.");
            }

        });
    } catch {
        alert("Error leyendo los XML adjuntados.");
    }
}

function readXML(files) {

    return Promise.all(
        (function* () {
            for (let file of files) {
                yield new Promise(resolve => {
                    let reader = new FileReader();
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsText(file);
                })
            }
        })());
}

function descargarXML(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }


const xslRef = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<xsl:stylesheet version="1.0" xmlns:xsd="https://www.w3.org/2001/XMLSchema" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">' +
    '	<xsl:template match="/">' +
    '		<predicciones xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="tiempo.xsd">' +
    '			<prediccion>' +
    '				<realizada>' +
    '					<xsl:value-of select="/root/elaborado"/>' +
    '				</realizada>' +
    '				<ubicacion>' +
    '					<xsl:attribute name="id">' +
    '						<xsl:value-of select="/root/@id"/>' +
    '					</xsl:attribute>' +
    '					<localidad>' +
    '						<nombre>' +
    '							<xsl:value-of select="/root/nombre"/>' +
    '						</nombre>' +
    '						<provincia>' +
    '							<xsl:value-of select="/root/provincia"/>' +
    '						</provincia>' +
    '					</localidad>' +
    '				</ubicacion>' +
    '				<dias>' +
    '					<xsl:for-each select="/root/prediccion/dia">' +
    '						<dia>' +
    '							<xsl:attribute name="fecha">' +
    '								<xsl:value-of select="@fecha"/>' +
    '							</xsl:attribute>' +
    '							<periodos>' +
    '								<xsl:variable name="cota_nieve_prov" select="cota_nieve_prov"/>' +
    '								<xsl:variable name="estado_cielo" select="estado_cielo"/>' +
    '								<xsl:variable name="viento" select="viento"/>' +
    '								<xsl:for-each select="prob_precipitacion">' +
    '									<periodo>' +
    '										<xsl:variable name="periodo" select="@periodo"/>' +
    '										<xsl:attribute name="intervalo">' +
    '											<xsl:value-of select="$periodo"/>' +
    '										</xsl:attribute>' +
    '										<xsl:choose>' +
    '											<xsl:when test="$periodo != \'\'">' +
    '												<xsl:if test="current() != \'\'">' +
    '													<precipitaciones>' +
    '														<xsl:value-of select="current()"/>' +
    '													</precipitaciones>' +
    '												</xsl:if>' +
    '												<xsl:for-each select="$cota_nieve_prov">' +
    '													<xsl:if test="@periodo = $periodo">' +
    '														<xsl:if test="current() != \'\'">' +
    '															<nieve>' +
    '																<xsl:value-of select="current()"/>' +
    '															</nieve>' +
    '														</xsl:if>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '												<xsl:for-each select="$estado_cielo">' +
    '													<xsl:if test="@periodo = $periodo">' +
    '														<xsl:if test="current() != \'\'">' +
    '															<cielo>' +
    '																<xsl:attribute name="estado">' +
    '																	<xsl:value-of select="@descripcion"/>' +
    '																</xsl:attribute>' +
    '																<xsl:value-of select="current()"/>' +
    '															</cielo>' +
    '														</xsl:if>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '												<xsl:for-each select="$viento">' +
    '													<xsl:if test="@periodo = $periodo">' +
    '														<xsl:if test="direccion != \'\'">' +
    '															<viento>' +
    '																<direccion>' +
    '																	<xsl:value-of select="direccion"/>' +
    '																</direccion>' +
    '																<velocidad>' +
    '																	<xsl:value-of select="velocidad"/>' +
    '																</velocidad>' +
    '															</viento>' +
    '														</xsl:if>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '												<xsl:for-each select="racha_max">' +
    '													<xsl:if test="@periodo = $periodo">' +
    '														<xsl:if test="current() != \'\'">' +
    '															<rachas>' +
    '																<xsl:value-of select="current()"/>' +
    '															</rachas>' +
    '														</xsl:if>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '											</xsl:when>' +
    '											<xsl:otherwise>' +
    '												<xsl:if test="current() != \'\'">' +
    '													<precipitaciones>' +
    '														<xsl:value-of select="current()"/>' +
    '													</precipitaciones>' +
    '												</xsl:if>' +
    '												<xsl:for-each select="$cota_nieve_prov">' +
    '													<xsl:if test="current() != \'\'">' +
    '														<nieve>' +
    '															<xsl:value-of select="current()"/>' +
    '														</nieve>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '												<xsl:for-each select="$estado_cielo">' +
    '													<xsl:if test="current() != \'\'">' +
    '														<cielo>' +
    '															<xsl:attribute name="estado">' +
    '																<xsl:value-of select="@descripcion"/>' +
    '															</xsl:attribute>' +
    '															<xsl:value-of select="current()"/>' +
    '														</cielo>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '												<xsl:for-each select="$viento">' +
    '													<xsl:if test="direccion != \'\'">' +
    '														<viento>' +
    '															<direccion>' +
    '																<xsl:value-of select="direccion"/>' +
    '															</direccion>' +
    '															<velocidad>' +
    '																<xsl:value-of select="velocidad"/>' +
    '															</velocidad>' +
    '														</viento>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '												<xsl:for-each select="racha_max">' +
    '													<xsl:if test="current() != \'\'">' +
    '														<rachas>' +
    '															<xsl:value-of select="current()"/>' +
    '														</rachas>' +
    '													</xsl:if>' +
    '												</xsl:for-each>' +
    '											</xsl:otherwise>' +
    '										</xsl:choose>' +
    '									</periodo>' +
    '								</xsl:for-each>' +
    '							</periodos>' +
    '							<datos>' +
    '								<dato valor="temperatura">' +
    '									<max>' +
    '										<xsl:value-of select="temperatura/maxima"/>' +
    '									</max>' +
    '									<min>' +
    '										<xsl:value-of select="temperatura/minima"/>' +
    '									</min>' +
    '                               <xsl:if test="temperatura/dato != \'\'">'+
    '									<horas>' +
    '										<xsl:for-each select="temperatura/dato">' +
    '											<hora>' +
    '												<xsl:attribute name="valor">' +
    '													<xsl:value-of select="@hora"/>' +
    '												</xsl:attribute>' +
    '												<xsl:value-of select="current()"/>' +
    '											</hora>' +
    '										</xsl:for-each>' +
    '									</horas>' +
    '                               </xsl:if>'+
    '								</dato>' +
    '								<dato valor="sens_termica">' +
    '									<max>' +
    '										<xsl:value-of select="sens_termica/maxima"/>' +
    '									</max>' +
    '									<min>' +
    '										<xsl:value-of select="sens_termica/minima"/>' +
    '									</min>' +
    '                               <xsl:if test="humedad_relativa/dato != \'\'">'+
    '									<horas>' +
    '										<xsl:for-each select="sens_termica/dato">' +
    '											<hora>' +
    '												<xsl:attribute name="valor">' +
    '													<xsl:value-of select="@hora"/>' +
    '												</xsl:attribute>' +
    '												<xsl:value-of select="current()"/>' +
    '											</hora>' +
    '										</xsl:for-each>' +
    '									</horas>' +
    '                               </xsl:if>'+
    '								</dato>' +
    '								<dato valor="humedad_relativa">' +
    '									<max>' +
    '										<xsl:value-of select="humedad_relativa/maxima"/>' +
    '									</max>' +
    '									<min>' +
    '										<xsl:value-of select="humedad_relativa/minima"/>' +
    '									</min>' +
    '                               <xsl:if test="humedad_relativa/dato != \'\'">'+
    '									<horas>' +
    '										<xsl:for-each select="humedad_relativa/dato">' +
    '											<hora>' +
    '												<xsl:attribute name="valor">' +
    '													<xsl:value-of select="@hora"/>' +
    '												</xsl:attribute>' +
    '												<xsl:value-of select="current()"/>' +
    '											</hora>' +
    '										</xsl:for-each>' +
    '									</horas>' +
    '                               </xsl:if>'+
    '								</dato>' +
    '							</datos>' +
    '							<xsl:if test="uv_max != \'\'">' +
    '								<uvmax>' +
    '									<xsl:value-of select="uv_max"/>' +
    '								</uvmax>' +
    '							</xsl:if>' +
    '						</dia>' +
    '					</xsl:for-each>' +
    '				</dias>' +
    '			</prediccion>' +
    '		</predicciones>' +
    '	</xsl:template>' +
    '</xsl:stylesheet>';