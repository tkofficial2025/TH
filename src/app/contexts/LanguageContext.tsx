import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface Translations {
  [key: string]: {
    en: string;
    zh: string;
  };
}

const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', zh: '首页' },
  'nav.buy': { en: 'Buy', zh: '买房' },
  'nav.rent': { en: 'Rent', zh: '租房' },
  'nav.blog': { en: 'Blog', zh: '博客' },
  'nav.about': { en: 'About', zh: '关于我们' },
  'nav.consultation': { en: 'Free Consultation', zh: '免费咨询' },
  'nav.account': { en: 'My Account', zh: '我的账户' },
  'nav.signin': { en: 'Sign In', zh: '登录' },
  
  // Hero Section
  'hero.title.1': { en: 'Your Gateway to', zh: '' },
  'hero.title.2': { en: 'Japanese Real Estate', zh: '在东京拥有您的理想资产' },
  'hero.subtitle': { en: 'Buy and Live in Japan with Confidence', zh: '安心购房，无忧安居' },
  'hero.btn.consultation': { en: 'Book Free Consultation', zh: '预约免费咨询' },
  'hero.btn.social': { en: 'Contact Us on Social Media', zh: '通过社交媒体咨询' },
  
  // Quick Search
  'search.title': { en: 'Find Your Perfect Property in Tokyo', zh: '寻找您的理想之家' },
  'search.buy': { en: 'Buy', zh: '买房' },
  'search.rent': { en: 'Rent', zh: '租房' },
  'search.area.label': { en: 'Area', zh: '区域' },
  'search.area.placeholder': { en: 'Select Area', zh: '请选择区域' },
  'search.type.label': { en: 'Property Type', zh: '物业类型' },
  'search.type.placeholder': { en: 'Select Type', zh: '请选择类型' },
  'search.price.label': { en: 'Price Range', zh: '价格范围' },
  'search.price.placeholder': { en: 'Any Price', zh: '不限价格' },
  'search.btn': { en: 'Search Properties', zh: '搜索房源' },

  // Sections
  'section.featured.title': { en: 'Featured Properties', zh: '精选房源' },
  'section.featured.subtitle': { en: 'Handpicked premium properties in top locations', zh: '为您精选的核心地段优质房源' },
  'section.areas.title': { en: 'Popular Areas', zh: '热门区域' },
  'section.areas.subtitle': { en: 'Explore the most sought-after neighborhoods in Tokyo', zh: '探索东京最受欢迎的居住区' },
  'section.areas.explore_title': { en: 'Explore Tokyo Wards', zh: '探索东京各区' },
  'section.areas.explore_desc': { en: 'Discover popular areas across Tokyo, from central business districts to quiet residential neighborhoods.', zh: '从繁华商圈到宜居社区，探索东京人气区域。' },
  'section.areas.wards23': { en: '23 Special Wards', zh: '东京23区' },
  'section.areas.outer': { en: 'Outer 23 Wards', zh: '23区外' },
  'section.areas.view_rentals': { en: 'View Rentals', zh: '查看出租' },
  'section.areas.view_sale': { en: 'View for Sale', zh: '查看出售' },
  'section.areas.show_more': { en: 'Show more', zh: '显示更多' },
  'section.areas.show_less': { en: 'Show less', zh: '收起' },
  'section.areas.properties_count': { en: '{n} properties', zh: '{n} 个房源' },
  'section.featured.view_all': { en: 'View all', zh: '查看全部' },
  'section.featured.loading': { en: 'Loading...', zh: '加载中...' },
  'section.featured.empty': { en: 'No featured properties', zh: '暂无精选房源' },
  'section.categories.title': { en: 'Search by Categories', zh: '按类别搜索' },
  'section.categories.properties_count': { en: '{n} Properties', zh: '{n} 个房源' },
  'category.pet_friendly': { en: 'Pet friendly', zh: '允许养宠物' },
  'search.advanced_filters': { en: 'Advanced filters', zh: '高级筛选' },
  'section.why.title': { en: 'Why Tokyo Expat Housing', zh: '为什么选择我们' },
  'section.why.subtitle': { en: 'Your trusted partner in Japanese real estate', zh: '您值得信赖的日本置业伙伴' },

  // Why Us
  'why.support.title': { en: 'Multilingual Support', zh: '多语言服务' },
  'why.support.desc': { en: 'Full support in English and Chinese throughout your entire journey.', zh: '提供全程中英文无障碍沟通服务。' },
  'why.process.title': { en: 'Transparent Process', zh: '流程透明' },
  'why.process.desc': { en: 'Clear explanations of all costs, contracts, and legal requirements.', zh: '清晰讲解所有费用、合同及法律要求。' },
  'why.network.title': { en: 'Extensive Network', zh: '海量房源' },
  'why.network.desc': { en: 'Access to exclusive off-market properties across Tokyo.', zh: '独家渠道，获取东京未公开的优质房源。' },

  // Trust Section
  'trust.brokerage.title': { en: 'Licensed & Compliant Brokerage', zh: '正规持牌中介' },
  'trust.brokerage.desc': { en: 'Officially registered under Japanese real estate law with full regulatory compliance and transparent transaction management.', zh: '严格遵守日本房地产法律正式注册，合规经营，交易管理透明。' },
  'trust.multilingual.title': { en: 'Multilingual Professional Support', zh: '多语言专业支持' },
  'trust.multilingual.desc': { en: 'Dedicated multilingual team providing contract explanation, negotiation, and full transaction assistance.', zh: '专业多语言团队，提供合同讲解、价格谈判及全程交易协助。' },
  'trust.specialist.title': { en: 'Foreign Resident Specialists', zh: '外籍人士置业专家' },
  'trust.specialist.desc': { en: 'Extensive experience assisting expats and non-Japanese residents with rentals and purchases.', zh: '在协助外籍人士和非日籍居民租房、买房方面拥有丰富经验。' },

  // Process Section
  'process.title': { en: 'Our Process', zh: '服务流程' },
  'process.step1.title': { en: 'Initial Consultation', zh: '初步咨询' },
  'process.step1.desc': { en: 'Contact us via email, LINE, WeChat, Whatsapp, Instagram, or the inquiry form. Share your goals (rent or purchase), budget, preferred area, timeline, and any special requirements.', zh: '通过邮件、LINE、微信、Whatsapp、Instagram 或咨询表单联系我们。分享您的目标（租房或买房）、预算、意向区域、时间表及任何特殊要求。' },
  'process.step2.title': { en: 'Property Proposal', zh: '房源提案' },
  'process.step2.desc': { en: 'Based on your needs, we carefully select suitable properties and provide:', zh: '根据您的需求，我们精选合适的房源并提供：' },
  'process.step2.list1': { en: 'Photos & floor plans', zh: '照片与户型图' },
  'process.step2.list2': { en: 'Pricing details', zh: '价格详情' },
  'process.step2.list3': { en: 'Estimated initial costs', zh: '预估初期费用' },
  'process.step2.list4': { en: 'Key property information', zh: '关键房源信息' },
  'process.step3.title': { en: 'Viewing & Application', zh: '看房与申请' },
  'process.step3.desc': { en: 'We arrange property viewings (in-person or virtual). Once you find your ideal home, we guide you through the application process and negotiate terms on your behalf.', zh: '我们安排看房（实地或视频）。一旦您找到理想的房子，我们将指导您完成申请流程并代表您进行条款谈判。' },
  'process.step4.title': { en: 'Contract & Handover', zh: '合同与交房' },
  'process.step4.desc': { en: 'We explain all contract details clearly in your preferred language. After signing, we coordinate the payment schedule and key handover for a smooth move-in experience.', zh: '我们用您熟悉的语言清晰地讲解所有合同细节。签约后，我们协调付款时间表和钥匙交接，确保您顺利入住。' },
  'process.step3.heading': { en: 'Viewing (In-Person or Online)', zh: '看房（实地或线上）' },
  'process.step3.desc_long': { en: 'You may visit the property in person or join an online viewing via Zoom. We explain the property condition, neighborhood, and relevant considerations.', zh: '您可实地看房或通过 Zoom 参加线上看房。我们会说明房屋状况、周边环境及注意事项。' },
  'process.step4.heading': { en: 'Application or Purchase Offer', zh: '申请或购房要约' },
  'process.step4.desc_rent': { en: 'For Rentals: We assist with the rental application and required documentation.', zh: '租房：我们协助您完成租赁申请及所需材料。' },
  'process.step4.desc_buy': { en: 'For Purchases: We help prepare and submit a formal purchase offer.', zh: '买房：我们协助准备并提交正式购房要约。' },
  'process.step5.heading': { en: 'Screening or Negotiation', zh: '审核或议价' },
  'process.step5.desc_rent': { en: 'Rentals: Landlord screening (2–5 business days).', zh: '租房：房东审核（约 2–5 个工作日）。' },
  'process.step5.desc_buy': { en: 'Purchases: Price negotiation and agreement on terms.', zh: '买房：价格协商及条款确认。' },
  'process.step6.heading': { en: 'Contract Preparation & Explanation', zh: '合同准备与说明' },
  'process.step6.desc': { en: 'We prepare the contract documents and clearly explain all terms and conditions in English before signing.', zh: '我们准备合同文件，并在签约前用英语清晰说明全部条款。' },
  'process.step7.heading': { en: 'Payment & Final Procedures', zh: '付款与最终手续' },
  'process.step7.desc_rent': { en: 'Rentals: Initial move-in costs (deposit, key money, agency fee, etc.)', zh: '租房：入住初期费用（押金、礼金、中介费等）' },
  'process.step7.desc_buy': { en: 'Purchases: Deposit payment and remaining balance settlement', zh: '买房：定金支付及尾款结算' },
  'process.step7.guide': { en: 'We guide you through every payment step.', zh: '我们全程协助您完成各项付款。' },
  'process.step8.heading': { en: 'Key Handover', zh: '钥匙交接' },
  'process.step8.desc': { en: 'Once procedures are completed, you receive the keys and officially take possession of your new home.', zh: '手续完成后，您将领取钥匙并正式入住新居。' },
  'why.section.title': { en: 'Why Tokyo Expat Housing', zh: '为什么选择 Tokyo Expat Housing' },
  'why.multilingual.title': { en: 'Multilingual Professional Support (EN / JP / CN / KR)', zh: '多语言专业支持（英 / 日 / 中 / 韩）' },
  'why.multilingual.desc': { en: 'Full support in four languages, ensuring accurate communication from property search to contract signing. No misunderstandings — just clear guidance tailored for international clients.', zh: '提供英日中韩四语全程支持，从找房到签约沟通无误。为国际客户提供清晰、贴心的指导。' },
  'why.approval.title': { en: 'Strong Approval Expertise for Foreign Clients', zh: '外籍客户审核通过率高' },
  'why.approval.desc': { en: 'We understand which properties and guarantor companies are more foreigner-friendly. Our structured approach helps maximize rental approval success and smooth transactions.', zh: '我们熟悉哪些房源与担保公司对外籍人士更友好，通过系统化流程提高租房通过率，让交易更顺畅。' },
  'why.fast.title': { en: 'Fast, Transparent & Structured Process', zh: '高效、透明、流程清晰' },
  'why.fast.desc': { en: 'We work with clear timelines and proactive coordination to meet your move-in goals. Every step — from pricing to paperwork — is explained clearly so you can move forward with confidence.', zh: '我们按明确时间表主动协调，助您顺利入住。从价格到文书，每一步都清晰说明，让您安心推进。' },
  'cta.title': { en: 'Ready to Start Your Journey?', zh: '准备好开始了吗？' },
  'cta.desc': { en: "Schedule a free consultation with our expert team. We'll guide you through every step of finding your perfect property in Japan.", zh: '预约我们的专家团队免费咨询。我们将全程协助您在日本找到理想房源。' },
  'cta.book': { en: 'Book Free Consultation', zh: '预约免费咨询' },
  'cta.browse': { en: 'Browse Properties', zh: '浏览房源' },
  'footer.follow': { en: 'Follow Us', zh: '关注我们' },
  'footer.mailto.subject': { en: 'Inquiry', zh: '咨询' },
  'footer.mailto.body': { en: 'Hello,\n\n', zh: '您好，\n\n' },
  'about.mailto.subject': { en: 'Inquiry', zh: '咨询' },
  'about.mailto.body': { en: 'Hello, I would like to inquire about...', zh: '您好，我想咨询...' },
  'property.loading': { en: 'Loading...', zh: '加载中...' },
  'property.favorite.add_aria': { en: 'Add to favorites', zh: '添加到收藏' },
  'property.favorite.remove_aria': { en: 'Remove from favorites', zh: '从收藏中移除' },
  'property.tour.signin_required': { en: 'Please sign in to your account to request a room tour.', zh: '请先登录账户以预约看房。' },
  'property.tour.submit_error': { en: 'Failed to submit. Please try again.', zh: '提交失败，请重试。' },
  'property.tour.time_range': { en: 'Time range', zh: '时间段' },
  'property.tour.option_n': { en: 'Option {n}', zh: '选项 {n}' },
  'listing.title.rent': { en: 'Properties for rent', zh: '出租房源' },
  'listing.title.rent.ward': { en: 'Properties for rent in {ward}', zh: '{ward} 的出租房源' },
  'listing.results_count': { en: '{count} results', zh: '{count} 个结果' },
  'listing.monthly_rent_label': { en: 'Monthly Rent:', zh: '月租金：' },
  'activity.details_requested': { en: 'Details requested', zh: '已索取详情' },
  'activity.room_tour_booked': { en: 'Room tour booked', zh: '已预约看房' },
  'activity.for_rent': { en: 'For Rent', zh: '出租' },
  'activity.for_sale': { en: 'For Sale', zh: '出售' },
  'listing.properties_found': { en: '{count} properties found', zh: '共 {count} 个房源' },
  'account.favorites': { en: 'Favorites', zh: '收藏夹' },
  'account.activity': { en: 'Activity', zh: '我的动态' },
  'account.profile': { en: 'Profile', zh: '个人资料' },
  'account.logout': { en: 'Logout', zh: '退出登录' },
  'account.user': { en: 'User', zh: '用户' },
  'favorites.title': { en: 'Favorites', zh: '收藏夹' },
  'favorites.no_favorites': { en: 'No favorites yet.', zh: '暂无收藏。' },
  'favorites.no_match_rent': { en: '0 rental properties match the filters.', zh: '没有符合筛选条件的出租房源。' },
  'favorites.no_match_buy': { en: '0 properties for sale match the filters.', zh: '没有符合筛选条件的出售房源。' },
  'activity.title': { en: 'Applied Properties', zh: '已申请房源' },
  'activity.subtitle': { en: 'View properties for which you have requested a room tour or property details.', zh: '查看您已预约看房或索取详情的房源。' },
  'activity.preferred_tour_dates': { en: 'Preferred tour dates', zh: '首选看房日期' },

          // Property Detail
          'property.back': { en: 'Back', zh: '返回' },
          'property.photo': { en: 'Photo', zh: '照片' },
          'property.photo.disclaimer': { en: '※The building completion forecast image is based on the drawing and may differ from the actual property.', zh: '※建筑竣工效果图基于图纸制作，可能与实际情况有所差异。' },
          'property.brochure': { en: 'Brochure', zh: '宣传册' },
          'property.favorite.added': { en: 'Added to Favorites.', zh: '已添加到收藏夹。' },
          'property.favorite.removed': { en: 'Removed from Favorites.', zh: '已从收藏夹移除。' },
          'property.favorite.error': { en: 'Could not save. Please try again.', zh: '无法保存，请重试。' },
          'property.initial_fees_card': { en: 'Initial fees can be paid by credit card', zh: '初期费用可使用信用卡支付' },
          'property.initial_fees_card_note': { en: '*Additional transaction fees may apply', zh: '*可能收取额外的交易手续费' },
  'property.tour.title': { en: 'Request a Tour', zh: '预约看房' },
  'property.tour.date1': { en: 'Candidate Date 1', zh: '候选日期 1' },
  'property.tour.date2': { en: 'Candidate Date 2', zh: '候选日期 2' },
  'property.tour.date3': { en: 'Candidate Date 3', zh: '候选日期 3' },
  'property.tour.name': { en: 'Name', zh: '姓名' },
  'property.tour.email': { en: 'Email', zh: '邮箱' },
  'property.tour.submit': { en: 'Request Tour', zh: '提交预约' },
  'property.tour.success': { en: 'Tour requested successfully. We will contact you soon.', zh: '看房预约成功。我们将尽快与您联系。' },
  'property.inquiry.title': { en: 'Inquire About This Property', zh: '咨询此房源' },
  'property.inquiry.name': { en: 'Name', zh: '姓名' },
  'property.inquiry.email': { en: 'Email', zh: '邮箱' },
  'property.inquiry.message': { en: 'Message (optional)', zh: '留言（选填）' },
  'property.inquiry.submit': { en: 'Send Inquiry', zh: '发送咨询' },
  'property.inquiry.success': { en: 'Inquiry sent successfully.', zh: '咨询发送成功。' },
  'property.overview': { en: 'Overview', zh: '概览' },
  'property.description': { en: 'Property Description', zh: '房源描述' },
  'property.location': { en: 'Location', zh: '位置' },
  'property.features': { en: 'Features & Amenities', zh: '设施与配套' },
  'property.readMore': { en: 'Read More', zh: '阅读更多' },
  'property.showLess': { en: 'Show Less', zh: '收起' },
  'property.information': { en: 'Property Information', zh: '房源信息' },
  'property.type': { en: 'Type', zh: '类型' },
  'property.layout': { en: 'Layout', zh: '户型' },
  'property.size': { en: 'Size', zh: '面积' },
  'property.built': { en: 'Built', zh: '竣工年份' },
          'property.floor': { en: 'Floor', zh: '楼层' },
          'property.station': { en: 'Station', zh: '车站' },
          'property.notfound': { en: 'Property not found', zh: '未找到房源' },
          'property.price.rent': { en: 'Monthly rent', zh: '月租金' },
          'property.price.buy': { en: 'Price', zh: '售价' },
          'property.feature.pet': { en: 'Pet-friendly', zh: '允许养宠物' },
          'property.feature.foreign': { en: 'Foreign-friendly', zh: '外籍友好' },
          'property.feature.balcony': { en: 'Balcony', zh: '阳台' },
          'property.feature.bicycle': { en: 'Bicycle parking', zh: '自行车停放处' },
          'property.feature.delivery': { en: 'Delivery box', zh: '快递箱' },
          'property.feature.elevator': { en: 'Elevator', zh: '电梯' },
          'property.feature.south': { en: 'South facing', zh: '朝南' },
          'property.tour.instruction': { en: 'Please provide up to 3 preferred date and time options. We will contact you to confirm.', zh: '请提供最多3个首选日期和时间选项。我们将与您联系以确认。' },
          'property.tour.option': { en: 'Option', zh: '选项' },
          'property.tour.date': { en: 'Date', zh: '日期' },
          'property.tour.time': { en: 'Time', zh: '时间' },
          'property.tour.time.any': { en: 'Any time', zh: '任何时间' },
          'property.tour.time.morning': { en: 'Morning', zh: '上午' },
          'property.tour.time.afternoon': { en: 'Afternoon', zh: '下午' },
          'property.tour.time.evening': { en: 'Evening', zh: '晚上' },
          'property.placeholder.name': { en: 'Your Name', zh: '您的姓名' },
          'property.placeholder.email': { en: 'your@email.com', zh: '您的电子邮箱' },
          'property.placeholder.message': { en: 'Any questions about this property?', zh: '关于此房源有任何疑问吗？' },
          'property.sending': { en: 'Sending...', zh: '发送中...' },
          'property.walk.min': { en: 'min walk', zh: '分钟步行' },
          'property.management_fee': { en: 'Management fee', zh: '管理费' },
          'property.deposit': { en: 'Deposit', zh: '押金' },
          'property.no_deposit': { en: 'No deposit', zh: '无押金' },
          'property.key_money': { en: 'Key money', zh: '礼金' },
          'property.no_key_money': { en: 'No key money', zh: '无礼金' },
          'property.bedrooms': { en: 'Bedrooms', zh: '卧室数量' },
          'property.rental_fees': { en: 'Rental fees', zh: '租赁费用' },

          // Listing & Filters
          'filter.title': { en: 'Filters', zh: '筛选' },
          'filter.show_map': { en: 'Show map', zh: '显示地图' },
          'map.loading': { en: 'Loading map...', zh: '地图加载中...' },
          'map.no_address': { en: 'No address provided.', zh: '未提供地址。' },
          'map.geocode_error': { en: 'Could not get location from address.', zh: '无法根据地址获取位置。' },
          'map.cannot_display': { en: 'Cannot display map.', zh: '无法显示地图。' },
          'map.property_location': { en: 'Property location', zh: '房源位置' },
          'map.cluster_count': { en: '{n} properties', zh: '{n} 个房源' },
          'map.click_to_zoom': { en: 'Click to zoom in', zh: '点击放大' },
          'map.view_details_new_tab': { en: 'View details (new tab)', zh: '查看详情（新标签页）' },
          'map.bed': { en: 'bed', zh: '室' },
          'map.no_properties': { en: 'No properties to show on map.', zh: '地图上暂无房源。' },
          'filter.hide': { en: 'Hide', zh: '隐藏' },
          'filter.show': { en: 'Show', zh: '显示' },
          'filter.search': { en: 'Search', zh: '搜索' },
          'filter.property_type': { en: 'Property Type', zh: '房源类型' },
          'filter.type.apartment': { en: 'Apartment', zh: '公寓' },
          'filter.type.condominium': { en: 'Condominium', zh: '高级公寓' },
          'filter.type.house': { en: 'House', zh: '独栋别墅' },
          'filter.type.studio': { en: 'Studio', zh: '单身公寓' },
          'filter.station': { en: 'Station', zh: '车站' },
          'filter.price_range': { en: 'Price range', zh: '价格范围' },
          'filter.no_min': { en: 'No min', zh: '不限下限' },
          'filter.no_max': { en: 'No max', zh: '不限上限' },
          'filter.size': { en: 'Size (m²)', zh: '面积 (m²)' },
          'filter.bedrooms': { en: 'Bedrooms', zh: '户型' },
          'filter.bedrooms.any': { en: 'Any', zh: '不限' },
          'filter.more_filters': { en: 'More filters', zh: '更多筛选' },
          'filter.categories': { en: 'Categories', zh: '类别' },
          'filter.save': { en: 'Save', zh: '保存' },
          
          'category.luxury': { en: 'Luxury', zh: '豪华' },
          'category.furnished': { en: 'Furnished', zh: '带家具' },
          'category.high_rise': { en: 'High-Rise Residence', zh: '高层住宅' },
          'category.no_key_money': { en: 'No key money', zh: '无礼金' },
          'category.students': { en: 'For students', zh: '适合学生' },
          'category.designers': { en: 'Designers', zh: '设计师公寓' },
          'category.families': { en: 'For families', zh: '适合家庭' },

          'sort.popularity': { en: 'Popularity', zh: '热门程度' },
          'sort.price_asc': { en: 'Price (Low to High)', zh: '价格 (从低到高)' },
          'sort.price_desc': { en: 'Price (High to Low)', zh: '价格 (从高到低)' },
          'sort.size_asc': { en: 'Size (Small to Large)', zh: '面积 (从小到大)' },
          'sort.size_desc': { en: 'Size (Large to Small)', zh: '面积 (从大到小)' },
          'sort.walking_asc': { en: 'Walking (Near to Far)', zh: '步行 (从近到远)' },
          'sort.walking_desc': { en: 'Walking (Far to Near)', zh: '步行 (从远到近)' },
          'sort.newest': { en: 'Newest', zh: '最新' },
          'sort.oldest': { en: 'Oldest', zh: '最早' },
          'sort.label': { en: 'Sort by', zh: '排序' },
          'listing.title': { en: 'Properties for sale', zh: '出售房源' },
          'listing.title.ward': { en: 'Properties for sale in {ward}', zh: '{ward}的出售房源' },
          'listing.results': { en: '{count} results', zh: '{count} 个结果' },
          'listing.loading': { en: 'Loading...', zh: '加载中...' },
          'listing.error': { en: 'Error: {error}', zh: '错误: {error}' },
          'listing.empty': { en: 'No properties found.', zh: '未找到房源。' },
          'listing.badge.popular': { en: 'POPULAR', zh: '热门' },
          'listing.badge.new': { en: 'New', zh: '新上' },

          'listing.load_more': { en: 'Load more', zh: '加载更多' },

          // Consultation
          'consult.title': { en: 'Free Consultation', zh: '免费咨询' },
          'consult.desc': { en: "Tell us about your goals. We'll get back to you within 24 hours to schedule a call or meeting.", zh: '告诉我们您的目标。我们将在 24 小时内与您联系，安排电话或会议。' },
          'consult.thank_you': { en: 'Thank you', zh: '谢谢' },
          'consult.success_desc': { en: "We've received your request. Our team will contact you within 24 hours.", zh: '我们已收到您的请求。我们的团队将在 24 小时内与您联系。' },
          'consult.back_home': { en: 'Back to Home', zh: '返回首页' },
          'consult.name': { en: 'Name *', zh: '姓名 *' },
          'consult.name_ph': { en: 'Your name', zh: '您的姓名' },
          'consult.email': { en: 'Email *', zh: '邮箱 *' },
          'consult.email_ph': { en: 'you@example.com', zh: 'you@example.com' },
          'consult.phone': { en: 'Phone', zh: '电话' },
          'consult.phone_ph': { en: 'Phone number', zh: '电话号码' },
          'consult.search_country': { en: 'Search country...', zh: '搜索国家...' },
          'consult.interest': { en: 'I am interested in...', zh: '我感兴趣的是...' },
          'consult.interest_rent': { en: 'Renting a property', zh: '租房' },
          'consult.interest_buy': { en: 'Buying a property', zh: '买房' },
          'consult.date': { en: 'Preferred Date & Time', zh: '期望日期与时间' },
          'consult.online': { en: 'I prefer an online meeting (Zoom/Google Meet)', zh: '我倾向于线上会议 (Zoom/Google Meet 等)' },
          'consult.message': { en: 'How can we help you?', zh: '我们能为您提供什么帮助？' },
          'consult.message_ph': { en: 'Please share your budget, preferred areas, and any specific requirements...', zh: '请分享您的预算、意向区域以及任何特殊要求...' },
          'consult.submit': { en: 'Request Consultation', zh: '提交咨询' },

          // About Us
          'about.title': { en: 'About Us', zh: '关于我们' },
          'about.p1': { en: 'Tokyo Expat Housing (operated by Jokyo Property Co., Ltd.) is a Tokyo-based real estate service dedicated to international residents, students, and global clients.', zh: 'Tokyo Expat Housing（由上京プロパティ株式会社运营）是一家总部位于东京的房地产服务机构，致力于为国际居民、留学生及全球客户提供服务。' },
          'about.p2': { en: 'We specialize in helping international clients find ideal properties in Tokyo through clear communication, transparent fees, and full multilingual support.', zh: '我们专注于通过清晰的沟通、透明的收费标准和全面的多语言支持，帮助国际客户在东京找到理想的房产。' },
          'about.p3': { en: 'Our team brings diverse international experience, with backgrounds connected to the United States, China, and Korea. This global perspective enables us to understand cultural expectations, communication styles, and the unique challenges clients may face when relocating to Japan.', zh: '我们的团队拥有丰富的国际经验，具备与美国、中国和韩国相关的背景。这种全球视野使我们能够深入理解客户的文化期望、沟通方式，以及在移居日本时可能面临的独特挑战。' },
          'about.p4': { en: "Navigating Japan's housing system can be complex — from guarantor requirements to detailed contract procedures. Our role is to simplify the process and provide accurate, straightforward guidance at every step.", zh: '日本的住房系统可能相当复杂——从保证人要求到繁琐的合同程序。我们的职责是简化这一过程，并在每一步为您提供准确、直接的指导。' },
          'about.company_profile': { en: 'Company Profile', zh: '公司简介' },
          'about.company_name': { en: 'Company Name', zh: '公司名称' },
          'about.company_name_val': { en: 'Jokyo Property Co., Ltd.', zh: '上京プロパティ株式会社' },
          'about.license': { en: 'License', zh: '营业执照' },
          'about.license_val': { en: 'Tokyo Governor License (1) No. 113518', zh: '东京都知事执照 (1) 第113518号' },
          'about.corporate_number': { en: 'Corporate Number', zh: '法人编号' },
          'about.director': { en: 'Representative Director', zh: '代表取缔役' },
          'about.director_val': { en: 'Kosei Kudo', zh: '工藤 幸正' },
          'about.address': { en: 'Address', zh: '地址' },
          'about.address_val': { en: '77 Space 102, 3-1-5 Kita-Otsuka, Toshima-ku, Tokyo 170-0004, Japan', zh: '日本东京都丰岛区北大塚3-1-5 77Space 102 (邮编: 170-0004)' },
          'about.phone': { en: 'Phone', zh: '电话' },
          'about.email': { en: 'Email', zh: '电子邮箱' },

          // Blog
          'blog.title': { en: 'Blog', zh: '博客' },
          'blog.all': { en: 'All', zh: '全部' },
          'blog.loading': { en: 'Loading posts...', zh: '正在加载文章...' },
          'blog.error': { en: 'Error', zh: '错误' },
          'blog.error_desc': { en: 'Failed to load posts.', zh: '加载文章失败。' },
          'blog.not_found': { en: 'Post not found.', zh: '未找到文章。' },
          'blog.back_to_list': { en: 'Back to Blog List', zh: '返回博客列表' },
          'blog.preparing': { en: 'Preparing', zh: '准备中' },

          // Footer
  'footer.about': { en: 'Tokyo Expat Housing provides comprehensive real estate services for international clients, specializing in premium properties across Tokyo.', zh: 'Tokyo Expat Housing 致力于为全球客户提供全面的房地产服务，专注于东京的优质房产。' },
  'footer.quickLinks': { en: 'Quick Links', zh: '快捷链接' },
  'footer.contact': { en: 'Contact', zh: '联系我们' },
  'footer.address': { en: 'Tokyo, Japan', zh: '日本 东京' },
  'footer.rights': { en: '© 2026 Tokyo Expat Housing. All rights reserved.', zh: '© 2026 Tokyo Expat Housing. 保留所有权利。' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const path = window.location.pathname;
    return path.startsWith('/zh/') || path === '/zh' ? 'zh' : 'en';
  });

  // Sync <html lang=""> with current language (for Chinese font and a11y)
  React.useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hans' : 'en';
  }, [language]);

  // Sync language changes with the URL
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const path = window.location.pathname;
    const isZh = path.startsWith('/zh/') || path === '/zh';
    
    if (lang === 'zh' && !isZh) {
      // Add /zh prefix
      const newPath = path === '/' ? '/zh' : `/zh${path}`;
      window.history.replaceState(null, '', `${newPath}${window.location.search}`);
    } else if (lang === 'en' && isZh) {
      // Remove /zh prefix
      const newPath = path === '/zh' ? '/' : path.substring(3);
      window.history.replaceState(null, '', `${newPath}${window.location.search}`);
    }
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}