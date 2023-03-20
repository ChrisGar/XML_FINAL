<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsd="https://www.w3.org/2001/XMLSchema" xmlns:xsi="https://www.w3.org/2001/XMLSchema-instance" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<predicciones xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="tiempo.xsd">
			<prediccion>
				<realizada>
					<xsl:value-of select="/root/elaborado"/>
				</realizada>
				<ubicacion>
					<xsl:attribute name="id">
						<xsl:value-of select="/root/@id"/>
					</xsl:attribute>
					<localidad>
						<nombre>
							<xsl:value-of select="/root/nombre"/>
						</nombre>
						<provincia>
							<xsl:value-of select="/root/provincia"/>
						</provincia>
					</localidad>
				</ubicacion>
				<dias>
					<xsl:for-each select="/root/prediccion/dia">
						<dia>
							<xsl:attribute name="fecha">
								<xsl:value-of select="@fecha"/>
							</xsl:attribute>
							<periodos>
								<xsl:variable name="cota_nieve_prov" select="cota_nieve_prov"/>
								<xsl:variable name="estado_cielo" select="estado_cielo"/>
								<xsl:variable name="viento" select="viento"/>
								<xsl:for-each select="prob_precipitacion">
									<periodo>
										<xsl:variable name="periodo" select="@periodo"/>
										<xsl:attribute name="intervalo">
											<xsl:value-of select="$periodo"/>
										</xsl:attribute>
										<xsl:choose>
											<xsl:when test="$periodo != ''">
												<xsl:if test="current() != ''">
													<precipitaciones>
														<xsl:value-of select="current()"/>
													</precipitaciones>
												</xsl:if>
												<xsl:for-each select="$cota_nieve_prov">
													<xsl:if test="@periodo = $periodo">
														<xsl:if test="current() != ''">
															<nieve>
																<xsl:value-of select="current()"/>
															</nieve>
														</xsl:if>
													</xsl:if>
												</xsl:for-each>
												<xsl:for-each select="$estado_cielo">
													<xsl:if test="@periodo = $periodo">
														<xsl:if test="current() != ''">
															<cielo>
																<xsl:attribute name="estado">
																	<xsl:value-of select="@descripcion"/>
																</xsl:attribute>
																<xsl:value-of select="current()"/>
															</cielo>
														</xsl:if>
													</xsl:if>
												</xsl:for-each>
												<xsl:for-each select="$viento">
													<xsl:if test="@periodo = $periodo">
														<xsl:if test="direccion != ''">
															<viento>
																<direccion>
																	<xsl:value-of select="direccion"/>
																</direccion>
																<velocidad>
																	<xsl:value-of select="velocidad"/>
																</velocidad>
															</viento>
														</xsl:if>
													</xsl:if>
												</xsl:for-each>
												<xsl:for-each select="racha_max">
													<xsl:if test="@periodo = $periodo">
														<xsl:if test="current() != ''">
															<rachas>
																<xsl:value-of select="current()"/>
															</rachas>
														</xsl:if>
													</xsl:if>
												</xsl:for-each>
											</xsl:when>
											<xsl:otherwise>
												<xsl:if test="current() != ''">
													<precipitaciones>
														<xsl:value-of select="current()"/>
													</precipitaciones>
												</xsl:if>
												<xsl:for-each select="$cota_nieve_prov">
													<xsl:if test="current() != ''">
														<nieve>
															<xsl:value-of select="current()"/>
														</nieve>
													</xsl:if>
												</xsl:for-each>
												<xsl:for-each select="$estado_cielo">
													<xsl:if test="current() != ''">
														<cielo>
															<xsl:attribute name="estado">
																<xsl:value-of select="@descripcion"/>
															</xsl:attribute>
															<xsl:value-of select="current()"/>
														</cielo>
													</xsl:if>
												</xsl:for-each>
												<xsl:for-each select="$viento">
													<xsl:if test="direccion != ''">
														<viento>
															<direccion>
																<xsl:value-of select="direccion"/>
															</direccion>
															<velocidad>
																<xsl:value-of select="velocidad"/>
															</velocidad>
														</viento>
													</xsl:if>
												</xsl:for-each>
												<xsl:for-each select="racha_max">
													<xsl:if test="current() != ''">
														<rachas>
															<xsl:value-of select="current()"/>
														</rachas>
													</xsl:if>
												</xsl:for-each>
											</xsl:otherwise>
										</xsl:choose>
									</periodo>
								</xsl:for-each>
							</periodos>
							<datos>
								<dato valor="temperatura">
									<max>
										<xsl:value-of select="temperatura/maxima"/>
									</max>
									<min>
										<xsl:value-of select="temperatura/minima"/>
									</min>
									<xsl:if test="temperatura/dato != ''">
										<horas>
											<xsl:for-each select="temperatura/dato">
												<hora>
													<xsl:attribute name="valor">
														<xsl:value-of select="@hora"/>
													</xsl:attribute>
													<xsl:value-of select="current()"/>
												</hora>
											</xsl:for-each>
										</horas>
									</xsl:if>
								</dato>
								<dato valor="sens_termica">
									<max>
										<xsl:value-of select="sens_termica/maxima"/>
									</max>
									<min>
										<xsl:value-of select="sens_termica/minima"/>
									</min>
									<xsl:if test="sens_termica/dato != ''">
										<horas>
											<xsl:for-each select="sens_termica/dato">
												<hora>
													<xsl:attribute name="valor">
														<xsl:value-of select="@hora"/>
													</xsl:attribute>
													<xsl:value-of select="current()"/>
												</hora>
											</xsl:for-each>
										</horas>
									</xsl:if>
								</dato>
								<dato valor="humedad_relativa">
									<max>
										<xsl:value-of select="humedad_relativa/maxima"/>
									</max>
									<min>
										<xsl:value-of select="humedad_relativa/minima"/>
									</min>
									<xsl:if test="humedad_relativa/dato != ''">
										<horas>
											<xsl:for-each select="humedad_relativa/dato">
												<hora>
													<xsl:attribute name="valor">
														<xsl:value-of select="@hora"/>
													</xsl:attribute>
													<xsl:value-of select="current()"/>
												</hora>
											</xsl:for-each>
										</horas>
									</xsl:if>
								</dato>
							</datos>
							<xsl:if test="uv_max != ''">
								<uvmax>
									<xsl:value-of select="uv_max"/>
								</uvmax>
							</xsl:if>
						</dia>
					</xsl:for-each>
				</dias>
			</prediccion>
		</predicciones>
	</xsl:template>
</xsl:stylesheet>