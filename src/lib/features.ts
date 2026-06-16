/**
 * Catálogo de funciones de IA / Advantage+ (creative_features_spec).
 * applies: "img" = solo imágenes · "vid" = solo vídeos · "both" = ambos
 */
export type Feature = { api: string; label: string; applies: "img" | "vid" | "both"; group: string };

export const FEATURES: Feature[] = [
  // 🎨 Visual
  { api: "standard_enhancements", label: "Mejoras estándar (brillo, contraste…)", applies: "both", group: "🎨 Visual" },
  { api: "image_touchups", label: "Retoques de imagen con IA", applies: "img", group: "🎨 Visual" },
  { api: "image_templates", label: "Plantillas / marcos con texto", applies: "img", group: "🎨 Visual" },
  { api: "image_background_gen", label: "Generar fondo nuevo con IA", applies: "img", group: "🎨 Visual" },
  { api: "image_animation", label: "Animar imagen estática", applies: "img", group: "🎨 Visual" },
  { api: "add_text_overlay", label: "Superponer texto automático", applies: "both", group: "🎨 Visual" },
  { api: "creative_stickers", label: "Pegatinas / stickers automáticos", applies: "both", group: "🎨 Visual" },
  { api: "multi_photo_to_video", label: "Varias fotos → vídeo", applies: "img", group: "🎨 Visual" },
  { api: "video_to_image", label: "Sacar imágenes del vídeo", applies: "vid", group: "🎨 Visual" },
  { api: "video_highlights", label: "Destacados automáticos del vídeo", applies: "vid", group: "🎨 Visual" },
  { api: "media_type_automation", label: "Convertir tipo de medio (img↔vídeo)", applies: "both", group: "🎨 Visual" },
  { api: "adapt_to_placement", label: "Adaptar el creativo a cada ubicación", applies: "both", group: "🎨 Visual" },
  { api: "media_order", label: "Reordenar medios automáticamente", applies: "both", group: "🎨 Visual" },
  // ✍️ Texto
  { api: "text_optimizations", label: "Generar variaciones de texto (IA)", applies: "both", group: "✍️ Texto" },
  { api: "description_automation", label: "Descripción automática", applies: "both", group: "✍️ Texto" },
  { api: "generate_cta", label: "Generar botón CTA automático", applies: "both", group: "✍️ Texto" },
  { api: "text_extraction_for_headline", label: "Sacar titular del contenido", applies: "both", group: "✍️ Texto" },
  { api: "text_extraction_for_tap_target", label: "Sacar texto para el botón", applies: "both", group: "✍️ Texto" },
  { api: "show_summary", label: "Mostrar resumen", applies: "both", group: "✍️ Texto" },
  { api: "show_destination_blurbs", label: "Mostrar descripciones del destino", applies: "both", group: "✍️ Texto" },
  // 🌐 Traducción
  { api: "text_translation", label: "Traducir el texto", applies: "both", group: "🌐 Traducción" },
  { api: "text_overlay_translation", label: "Traducir el texto superpuesto", applies: "both", group: "🌐 Traducción" },
  { api: "translate_voiceover", label: "Traducir la voz en off", applies: "vid", group: "🌐 Traducción" },
  // 🎵 Música
  { api: "music_generation", label: "Añadir música automática", applies: "vid", group: "🎵 Música" },
  // 🛒 Catálogo
  { api: "standard_enhancements_catalog", label: "Mejoras estándar de catálogo", applies: "both", group: "🛒 Catálogo" },
  { api: "product_extensions", label: "Extensiones de producto", applies: "both", group: "🛒 Catálogo" },
  { api: "customize_product_recommendation", label: "Recomendación de productos", applies: "both", group: "🛒 Catálogo" },
  { api: "hide_price", label: "Ocultar el precio", applies: "both", group: "🛒 Catálogo" },
  { api: "ads_with_benefits", label: "Mostrar ventajas / beneficios", applies: "both", group: "🛒 Catálogo" },
  // 👤 Perfil / extensiones
  { api: "profile_card", label: "Tarjeta de perfil del negocio", applies: "both", group: "👤 Perfil" },
  { api: "site_extensions", label: "Enlaces extra del sitio", applies: "both", group: "👤 Perfil" },
  { api: "local_store_extension", label: "Extensión de tienda local", applies: "both", group: "👤 Perfil" },
  { api: "inline_comment", label: "Comentario fijado automático", applies: "both", group: "👤 Perfil" },
  // 📍 Ubicación
  { api: "fb_feed_tag", label: "Optimizar para Feed de Facebook", applies: "both", group: "📍 Ubicación" },
  { api: "fb_reels_tag", label: "Optimizar para Reels de Facebook", applies: "both", group: "📍 Ubicación" },
  { api: "ig_feed_tag", label: "Optimizar para Feed de Instagram", applies: "both", group: "📍 Ubicación" },
  { api: "ig_reels_tag", label: "Optimizar para Reels de Instagram", applies: "both", group: "📍 Ubicación" },
];
