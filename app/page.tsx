const pageHtml = `<header class="site-header">
    <nav class="nav" aria-label="主导航">
      <a class="brand" href="#top" aria-label="泡泡爪宠物洗护店首页">
        <span class="brand-mark">爪</span>
        <span>泡泡爪宠物洗护</span>
      </a>
      <div class="nav-links">
        <a href="#services">洗护服务</a>
        <a href="#interior">店内环境</a>
        <a href="#pricing">套餐价格</a>
        <a href="#booking">预约到店</a>
        <a href="#store">门店信息</a>
      </div>
      <a class="nav-cta" href="#booking">立即预约</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero" aria-label="宠物洗护店介绍">
      <div class="hero-inner">
        <div class="hero-copy">
          <p class="eyebrow">预约制精品洗护 · 猫狗分区护理</p>
          <h1>泡泡爪宠物洗护店</h1>
          <p>从温和沐浴、基础美容到皮毛养护，我们用安静、透明、专业的流程，让每只小朋友干净舒适地回家。</p>
          <div class="hero-actions">
            <a class="primary-btn" href="#booking">预约洗护</a>
            <a class="secondary-btn" href="#pricing">查看价目</a>
          </div>
          <div class="hero-stats" aria-label="门店亮点">
            <div class="stat">
              <strong>45 分钟</strong>
              <span>小型犬快洗参考时长</span>
            </div>
            <div class="stat">
              <strong>1 对 1</strong>
              <span>护理师全程看护</span>
            </div>
            <div class="stat">
              <strong>6 项</strong>
              <span>基础健康观察记录</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="services" id="services">
      <div class="wrap">
        <div class="section-head">
          <h2>适合日常到店的洗护项目</h2>
          <p>每次服务前都会确认宠物年龄、皮肤状态和性格习惯，再安排更合适的水温、吹干方式与护理节奏。</p>
        </div>
        <div class="service-grid">
          <article class="service-card">
            <div>
              <div class="service-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M4 14h16"/><path d="M7 14v4"/><path d="M17 14v4"/><path d="M6 10c2-4 10-4 12 0"/><path d="M8 10h8"/></svg>
              </div>
              <h3>基础香波洗护</h3>
              <p>适合定期清洁、轻度打结和换季掉毛的宠物。</p>
            </div>
            <ul>
              <li>温和清洁、耳眼护理</li>
              <li>指甲修剪、脚底毛清理</li>
              <li>低噪吹干与毛发梳顺</li>
            </ul>
          </article>
          <article class="service-card">
            <div>
              <div class="service-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M5 8h14"/><path d="M7 16h10"/><path d="M8 3h8"/><path d="M8 21h8"/></svg>
              </div>
              <h3>造型美容修剪</h3>
              <p>根据品种、毛量和生活习惯做清爽好打理的造型。</p>
            </div>
            <ul>
              <li>脸部、身体、尾部造型</li>
              <li>局部开结与线条修整</li>
              <li>完工前造型确认</li>
            </ul>
          </article>
          <article class="service-card">
            <div>
              <div class="service-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M12 21s7-4.4 7-11a7 7 0 0 0-14 0c0 6.6 7 11 7 11Z"/><path d="M9 10h6"/><path d="M12 7v6"/></svg>
              </div>
              <h3>皮毛舒缓护理</h3>
              <p>为皮肤敏感、毛发干燥或季节性护理需求准备。</p>
            </div>
            <ul>
              <li>低刺激护理用品</li>
              <li>毛发滋养与蓬松处理</li>
              <li>护理后状态反馈</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section class="interior" id="interior">
      <div class="wrap">
        <div class="section-head">
          <h2>中国高端宠物洗护店内环境</h2>
          <p>接待、洗护、造型三个区域分区清晰，以温润木色、玉石绿和金属细节营造安静、干净、可信赖的到店体验。</p>
        </div>
        <div class="carousel" aria-label="店内环境轮播图">
          <article class="slide">
            <img src="/assets/interior-reception.png" alt="高端宠物洗护店接待休息区" />
            <div class="slide-copy">
              <span>Reception Lounge</span>
              <h3>接待休息区</h3>
              <p>到店登记、等候与零售展示集中在前厅，让主人第一眼就能感受到舒适与秩序。</p>
            </div>
          </article>
          <article class="slide">
            <img src="/assets/interior-wash-spa.png" alt="高端宠物洗护店洗护水疗区" />
            <div class="slide-copy">
              <span>Wash & Spa</span>
              <h3>洗护水疗区</h3>
              <p>独立洗护位、玻璃隔断和整洁用品陈列，兼顾卫生、动线与宠物安全感。</p>
            </div>
          </article>
          <article class="slide">
            <img src="/assets/interior-styling-room.png" alt="高端宠物洗护店美容造型区" />
            <div class="slide-copy">
              <span>Styling Studio</span>
              <h3>美容造型区</h3>
              <p>专业美容台和柔和照明适合精修造型，也方便护理师观察毛发细节。</p>
            </div>
          </article>
          <div class="carousel-dots" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </section>

    <section class="pricing" id="pricing">
      <div class="wrap">
        <div class="section-head">
          <h2>清晰的套餐价格</h2>
          <p>价格会根据体型、毛量、打结程度和宠物配合度微调，到店前可先发送照片评估。</p>
        </div>
        <div class="price-grid">
          <article class="price-card">
            <h3>猫咪净洗</h3>
            <p>短毛猫、长毛猫日常清洁。</p>
            <div class="price"><span>¥</span><b>128</b><span>起</span></div>
            <div class="price-note">含基础清洁与吹干</div>
          </article>
          <article class="price-card featured">
            <h3>小型犬精洗</h3>
            <p>泰迪、比熊、博美等常见体型。</p>
            <div class="price"><span>¥</span><b>98</b><span>起</span></div>
            <div class="price-note">门店热门预约项目</div>
          </article>
          <article class="price-card">
            <h3>美容修剪</h3>
            <p>洗护后造型、局部修整。</p>
            <div class="price"><span>¥</span><b>168</b><span>起</span></div>
            <div class="price-note">按造型复杂度评估</div>
          </article>
          <article class="price-card">
            <h3>局部护理</h3>
            <p>剪甲、清耳、剃脚底毛。</p>
            <div class="price"><span>¥</span><b>29</b><span>起</span></div>
            <div class="price-note">可单独到店处理</div>
          </article>
        </div>
      </div>
    </section>

    <section class="booking" id="booking">
      <div class="wrap booking-layout">
        <div class="booking-copy">
          <h2>提前预约，减少等待和应激</h2>
          <p>预约后我们会预留洗护位和护理师，并根据宠物情况准备合适的用品。表单为页面演示，可按你的真实联系方式继续接入提交功能。</p>
          <div class="process">
            <div class="step">
              <div class="step-number">01</div>
              <div><strong>提交宠物信息</strong><span>填写品种、体重、服务类型和希望到店时间。</span></div>
            </div>
            <div class="step">
              <div class="step-number">02</div>
              <div><strong>门店确认档期</strong><span>工作人员确认价格、时长和注意事项。</span></div>
            </div>
            <div class="step">
              <div class="step-number">03</div>
              <div><strong>到店安心洗护</strong><span>护理完成后反馈皮肤、耳朵、指甲和毛发状态。</span></div>
            </div>
          </div>
        </div>
        <div class="booking-panel" aria-label="预约表单">
          <form>
            <label>
              主人称呼
              <input type="text" placeholder="例如：陈女士" />
            </label>
            <label>
              联系电话
              <input type="tel" placeholder="请输入手机号" />
            </label>
            <label>
              宠物类型
              <select>
                <option>小型犬</option>
                <option>中大型犬</option>
                <option>猫咪</option>
                <option>其他宠物</option>
              </select>
            </label>
            <label>
              预约服务
              <select>
                <option>基础香波洗护</option>
                <option>造型美容修剪</option>
                <option>皮毛舒缓护理</option>
                <option>局部护理</option>
              </select>
            </label>
            <label>
              期望日期
              <input type="date" />
            </label>
            <label>
              期望时段
              <select>
                <option>10:00 - 12:00</option>
                <option>13:00 - 15:00</option>
                <option>15:00 - 17:00</option>
                <option>17:00 - 19:00</option>
              </select>
            </label>
            <label class="full">
              备注
              <textarea placeholder="可填写宠物体重、是否怕吹风、皮肤情况等"></textarea>
            </label>
            <p class="form-note full">提交按钮当前为静态演示，不会上传个人信息。</p>
            <button class="submit-btn full" type="button">提交预约意向</button>
          </form>
        </div>
      </div>
    </section>

    <section class="store" id="store">
      <div class="wrap">
        <div class="store-layout">
          <div class="store-panel">
            <h2>门店信息</h2>
            <ul class="store-list">
              <li class="store-info-item">
                <span class="store-info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 21s7-4.7 7-11a7 7 0 0 0-14 0c0 6.3 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>
                </span>
                <span>
                  <span class="store-info-label">地址</span>
                  <span class="store-info-value">上海市普陀区宜川路街道陕西北路 1620 号</span>
                </span>
              </li>
              <li class="store-info-item">
                <span class="store-info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                </span>
                <span>
                  <span class="store-info-label">营业时间</span>
                  <span class="store-info-value">周一至周日 09:30 - 20:30</span>
                </span>
              </li>
              <li class="store-info-item">
                <span class="store-info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6.3 6.3l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z"/></svg>
                </span>
                <span>
                  <span class="store-info-label">电话</span>
                  <span class="store-info-value">400-882-1024</span>
                </span>
              </li>
              <li class="store-info-item">
                <span class="store-info-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.7 8.7 0 0 1-3.8-.9L3 21l1.9-4.8a8.3 8.3 0 1 1 16.1-4.7Z"/></svg>
                </span>
                <span>
                  <span class="store-info-label">微信</span>
                  <span class="store-info-value">泡泡爪 Pet Spa</span>
                </span>
              </li>
            </ul>
          </div>
          <div class="store-map-card" aria-label="泡泡爪 Pet Spa 门店位置示意图">
            <svg class="store-map" viewBox="0 0 760 430" role="img" aria-labelledby="store-map-title">
              <title id="store-map-title">泡泡爪 Pet Spa 门店位置示意图</title>
              <rect width="760" height="430" fill="#fbf4df"/>
              <path class="water" d="M48 0c44 58 57 112 38 162-24 64-7 113 51 148 39 23 52 63 40 120H0V0Z"/>
              <path class="park" d="M230 176c83-46 155-55 216-28 67 30 118 29 153-4 43-40 94-35 153 15v271H214c-31-49-26-96 16-254Z"/>
              <rect class="block" x="92" y="18" width="90" height="54" rx="10"/>
              <rect class="block" x="204" y="18" width="86" height="58" rx="10"/>
              <rect class="block" x="313" y="18" width="118" height="62" rx="10"/>
              <rect class="block" x="458" y="18" width="86" height="58" rx="10"/>
              <rect class="block" x="591" y="21" width="112" height="65" rx="10"/>
              <rect class="block" x="112" y="96" width="94" height="58" rx="10"/>
              <rect class="block" x="230" y="96" width="96" height="60" rx="10"/>
              <rect class="block" x="351" y="98" width="94" height="58" rx="10"/>
              <rect class="block" x="596" y="111" width="98" height="62" rx="10"/>
              <rect class="block" x="76" y="244" width="90" height="62" rx="10"/>
              <rect class="block" x="91" y="327" width="116" height="62" rx="10"/>
              <rect class="block" x="523" y="295" width="96" height="58" rx="10"/>
              <path class="road-edge" d="M18 218C145 174 250 147 334 136c115-15 229-10 343 16"/>
              <path class="road" d="M18 218C145 174 250 147 334 136c115-15 229-10 343 16"/>
              <path class="road-edge" d="M511 0c-34 78-45 146-31 204 15 62 57 130 125 204"/>
              <path class="road" d="M511 0c-34 78-45 146-31 204 15 62 57 130 125 204"/>
              <path class="minor-road" d="M257 0c6 75 4 143-8 204-11 55-34 113-68 174"/>
              <path class="minor-road" d="M70 342c104-20 204-40 300-61 100-23 189-54 267-94"/>
              <path class="minor-road" d="M391 62c-28 58-45 112-51 162-7 54 1 111 24 170"/>
              <text class="label" x="102" y="51">116号楼</text>
              <text class="label" x="214" y="51">学生大厦</text>
              <text class="label" x="323" y="52">北京银行</text>
              <text class="label" x="600" y="59">人民医院</text>
              <text class="label" x="117" y="132">居民社区</text>
              <text class="label" x="233" y="132">LAWSON</text>
              <text class="label" x="358" y="132">生活广场</text>
              <text class="label" x="595" y="146">写字楼</text>
              <text class="label" x="91" y="282">茶饮</text>
              <text class="label" x="103" y="364">小吃街</text>
              <text class="label" x="530" y="331">宠物用品</text>
              <text class="label" x="460" y="207" transform="rotate(67 460 207)">陕西北路</text>
              <text class="label" x="246" y="186" transform="rotate(-10 246 186)">宜川路</text>
              <circle class="poi" cx="323" cy="106" r="8"/>
              <circle class="poi" cx="195" cy="207" r="8"/>
              <circle class="poi" cx="651" cy="223" r="8"/>
              <circle class="pin" cx="579" cy="133" r="34"/>
              <circle class="pin-paw" cx="579" cy="136" r="8"/>
              <circle class="pin-paw" cx="563" cy="122" r="6"/>
              <circle class="pin-paw" cx="578" cy="115" r="6"/>
              <circle class="pin-paw" cx="595" cy="122" r="6"/>
              <path class="pin-paw" d="M558 154c13 7 29 7 42 0-4 18-37 18-42 0Z"/>
              <path class="shop-card" d="M474 181h172a14 14 0 0 1 14 14v75a14 14 0 0 1-14 14H474a14 14 0 0 1-14-14v-75a14 14 0 0 1 14-14Z"/>
              <path class="shop-pill" d="M493 239h134a12 12 0 0 1 12 12v18H481v-18a12 12 0 0 1 12-12Z"/>
              <text class="shop-title" x="482" y="223">泡泡爪 Pet Spa</text>
              <text class="shop-subtitle" x="510" y="264">宠物洗护店</text>
              <path d="M505 239v-24h112v24" fill="#f6d7c4" stroke="#d7887c" stroke-width="2"/>
              <rect x="512" y="220" width="18" height="19" fill="#cfe9b6"/>
              <rect x="538" y="220" width="18" height="19" fill="#cfe9b6"/>
              <rect x="565" y="220" width="18" height="19" fill="#cfe9b6"/>
              <rect x="591" y="220" width="18" height="19" fill="#cfe9b6"/>
            </svg>
            <span class="map-note">示意地图，不代表真实比例</span>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-inner">
      <span>© 2026 泡泡爪宠物洗护店</span>
      <span>温柔洗护 · 透明报价 · 预约优先</span>
    </div>
  </footer>`;

export default function Home() {
  return <div dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
