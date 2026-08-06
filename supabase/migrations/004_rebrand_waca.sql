-- Rebrand defaults to WACA (万国古董文博协会)
update site_settings
set
  brand_cn = '万国古董文博协会',
  brand_zh = '萬國古董文博協會',
  brand_en = 'WACA',
  brand_sub_cn = 'World Antique Cultural-Heritage Association',
  brand_sub_zh = 'World Antique Cultural-Heritage Association',
  brand_sub_en = 'World Antique Cultural-Heritage Association',
  company_cn = '万国古董文博协会',
  company_zh = '萬國古董文博協會',
  company_en = 'World Antique Cultural-Heritage Association',
  contact_email = coalesce(nullif(contact_email, ''), 'info@waca.art'),
  address_cn = '马来西亚吉隆坡 · 槟城',
  address_zh = '馬來西亞吉隆坡 · 檳城',
  address_en = 'Kuala Lumpur · Penang, Malaysia',
  updated_at = now()
where id = 1;
