// 소, 돼지, 닭 부위별 인터랙티브 다이어그램 컴포넌트

class MeatMap {
    constructor(containerId, onSelectPart) {
        this.container = document.getElementById(containerId);
        this.onSelectPart = onSelectPart;
        this.currentAnimal = 'beef'; // beef, pork, chicken
    }

    setAnimal(animalKey) {
        this.currentAnimal = animalKey;
        this.render();
    }

    render() {
        if (!this.container) return;
        const animalData = window.GAME_DATA.meatGuide[this.currentAnimal];
        if (!animalData) return;

        let html = `
            <div class="meat-diagram-wrapper">
                <div class="meat-header-tabs">
                    <button class="meat-tab-btn ${this.currentAnimal === 'beef' ? 'active' : ''}" data-animal="beef">
                        🐂 소고기 부위
                    </button>
                    <button class="meat-tab-btn ${this.currentAnimal === 'pork' ? 'active' : ''}" data-animal="pork">
                        🐖 돼지고기 부위
                    </button>
                    <button class="meat-tab-btn ${this.currentAnimal === 'chicken' ? 'active' : ''}" data-animal="chicken">
                        🐓 닭고기 부위
                    </button>
                </div>

                <div class="meat-visual-display">
                    ${this.getAnimalVisualSvg(this.currentAnimal)}
                </div>

                <div class="meat-parts-grid">
                    ${animalData.parts.map(p => `
                        <div class="meat-part-chip" data-part-name="${p.name}" data-part-id="${p.id}">
                            <span class="part-name">${p.name}</span>
                            <span class="part-usage">${p.usage}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.bindEvents();
    }

    bindEvents() {
        // 동물 탭 전환
        const tabBtns = this.container.querySelectorAll('.meat-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.soundEngine) window.soundEngine.playPop();
                this.setAnimal(btn.getAttribute('data-animal'));
            });
        });

        // 부위 칩 클릭
        const chips = this.container.querySelectorAll('.meat-part-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                const partName = chip.getAttribute('data-part-name');
                const partId = chip.getAttribute('data-part-id');
                if (window.soundEngine) window.soundEngine.playPop();
                if (this.onSelectPart) {
                    this.onSelectPart(partName, partId, this.currentAnimal);
                }
            });
        });

        // SVG 내부 부위 클릭 연동
        const svgRegions = this.container.querySelectorAll('.svg-meat-part');
        svgRegions.forEach(region => {
            region.addEventListener('click', () => {
                const partName = region.getAttribute('data-part-name');
                const partId = region.getAttribute('data-part-id');
                if (window.soundEngine) window.soundEngine.playPop();
                if (this.onSelectPart) {
                    this.onSelectPart(partName, partId, this.currentAnimal);
                }
            });
        });
    }

    getAnimalVisualSvg(animal) {
        if (animal === 'beef') {
            return `
            <div class="svg-stage beef-stage">
                <svg viewBox="0 0 600 360" class="meat-svg">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <!-- 소 윤곽 배경 -->
                    <path class="animal-silhouette" d="M90,190 C60,160 80,110 120,110 C140,80 180,90 210,105 C260,95 330,95 390,110 C460,115 500,140 520,175 C535,210 525,260 480,270 L480,320 L445,320 L445,275 C420,280 370,285 300,285 L300,320 L265,320 L265,280 C220,280 170,270 145,255 L135,320 L105,320 L115,245 C95,230 85,210 90,190 Z" />

                    <!-- 소 부위들 (SVG 인터랙티브 폴리곤) -->
                    <!-- 목심 -->
                    <g class="svg-meat-part" data-part-name="목심" data-part-id="neck">
                        <polygon points="120,110 185,108 175,190 120,190 95,150" />
                        <text x="140" y="150">목심</text>
                    </g>
                    <!-- 등심,안심,채끝 -->
                    <g class="svg-meat-part highlight-part" data-part-name="등심·안심·채끝" data-part-id="sirloin">
                        <polygon points="185,108 385,110 380,185 175,190" />
                        <text x="270" y="145">등심·안심·채끝</text>
                    </g>
                    <!-- 우둔, 설도 -->
                    <g class="svg-meat-part" data-part-name="우둔·설도" data-part-id="round">
                        <polygon points="385,110 510,160 480,230 380,185" />
                        <text x="435" y="165">우둔·설도</text>
                    </g>
                    <!-- 갈비 -->
                    <g class="svg-meat-part" data-part-name="갈비" data-part-id="rib">
                        <polygon points="175,190 330,190 320,240 175,235" />
                        <text x="245" y="215">갈비</text>
                    </g>
                    <!-- 양지 -->
                    <g class="svg-meat-part" data-part-name="양지" data-part-id="brisket">
                        <polygon points="175,235 320,240 310,275 160,265" />
                        <text x="240" y="260">양지</text>
                    </g>
                    <!-- 앞다리 -->
                    <g class="svg-meat-part" data-part-name="앞다리" data-part-id="foreleg">
                        <polygon points="120,190 175,190 160,265 110,260" />
                        <text x="135" y="225">앞다리</text>
                    </g>
                    <!-- 사태 -->
                    <g class="svg-meat-part" data-part-name="사태" data-part-id="shank">
                        <polygon points="320,240 450,235 440,285 310,275" />
                        <text x="375" y="265">사태</text>
                    </g>
                </svg>
            </div>
            `;
        } else if (animal === 'pork') {
            return `
            <div class="svg-stage pork-stage">
                <svg viewBox="0 0 600 360" class="meat-svg">
                    <path class="animal-silhouette" d="M100,210 C80,195 70,165 95,140 C120,115 170,115 210,120 C270,115 360,115 425,125 C485,135 520,165 525,205 C530,245 490,265 470,270 L465,315 L430,315 L430,275 C400,280 340,285 270,285 L270,315 L235,315 L240,280 C190,280 155,270 140,260 L135,315 L105,315 L110,250 C95,235 90,225 100,210 Z" />

                    <!-- 목살 -->
                    <g class="svg-meat-part" data-part-name="목살" data-part-id="pork_neck">
                        <polygon points="125,135 195,130 190,195 125,195" />
                        <text x="155" y="165">목살</text>
                    </g>
                    <!-- 등심 -->
                    <g class="svg-meat-part" data-part-name="등심" data-part-id="pork_loin">
                        <polygon points="195,130 375,130 365,185 190,185" />
                        <text x="280" y="155">등심</text>
                    </g>
                    <!-- 안심 -->
                    <g class="svg-meat-part" data-part-name="안심" data-part-id="pork_tenderloin">
                        <polygon points="375,130 435,140 425,195 365,185" />
                        <text x="395" y="165">안심</text>
                    </g>
                    <!-- 삼겹살 -->
                    <g class="svg-meat-part" data-part-name="삼겹살" data-part-id="pork_belly">
                        <polygon points="200,220 380,220 370,270 195,270" />
                        <text x="285" y="250">삼겹살</text>
                    </g>
                    <!-- 갈비 -->
                    <g class="svg-meat-part" data-part-name="갈비" data-part-id="pork_rib">
                        <polygon points="190,185 300,185 295,220 195,220" />
                        <text x="245" y="205">갈비</text>
                    </g>
                    <!-- 갈매기살 -->
                    <g class="svg-meat-part" data-part-name="갈매기살" data-part-id="pork_skirt">
                        <polygon points="300,185 365,185 360,220 295,220" />
                        <text x="330" y="205">갈매기살</text>
                    </g>
                    <!-- 앞다리 -->
                    <g class="svg-meat-part" data-part-name="앞다리" data-part-id="pork_foreleg">
                        <polygon points="125,195 190,195 180,265 120,255" />
                        <text x="150" y="230">앞다리</text>
                    </g>
                    <!-- 뒷다리 -->
                    <g class="svg-meat-part" data-part-name="뒷다리" data-part-id="pork_hindleg">
                        <polygon points="435,140 505,190 465,255 420,240 425,195" />
                        <text x="460" y="200">뒷다리</text>
                    </g>
                    <!-- 사태 -->
                    <g class="svg-meat-part" data-part-name="사태" data-part-id="pork_shank">
                        <polygon points="370,240 425,240 420,275 365,275" />
                        <text x="395" y="260">사태</text>
                    </g>
                </svg>
            </div>
            `;
        } else {
            return `
            <div class="svg-stage chicken-stage">
                <svg viewBox="0 0 600 360" class="meat-svg">
                    <path class="animal-silhouette" d="M150,110 C165,80 205,75 220,110 C240,115 285,120 330,135 C380,155 430,190 440,240 C430,265 400,285 350,285 C300,285 240,270 190,245 C150,220 135,180 140,140 Z" />

                    <!-- 목 -->
                    <g class="svg-meat-part" data-part-name="목" data-part-id="chicken_neck">
                        <polygon points="170,100 230,105 210,155 160,145" />
                        <text x="190" y="130">목</text>
                    </g>
                    <!-- 가슴살, 안심 -->
                    <g class="svg-meat-part" data-part-name="가슴살·안심" data-part-id="chicken_breast">
                        <polygon points="160,145 270,155 245,235 155,200" />
                        <text x="210" y="190">가슴살·안심</text>
                    </g>
                    <!-- 날개 (봉, 윙) -->
                    <g class="svg-meat-part" data-part-name="봉·윙(날개)" data-part-id="chicken_wing">
                        <polygon points="230,105 320,130 305,180 235,160" />
                        <text x="270" y="150">봉·윙</text>
                    </g>
                    <!-- 넓적다리 -->
                    <g class="svg-meat-part" data-part-name="넓적다리" data-part-id="chicken_thigh">
                        <polygon points="270,155 375,165 355,230 255,225" />
                        <text x="315" y="195">넓적다리</text>
                    </g>
                    <!-- 닭다리 -->
                    <g class="svg-meat-part" data-part-name="닭다리" data-part-id="chicken_leg">
                        <polygon points="355,220 440,225 410,280 340,275" />
                        <text x="385" y="255">닭다리</text>
                    </g>
                    <!-- 닭발 -->
                    <g class="svg-meat-part" data-part-name="닭발" data-part-id="chicken_feet">
                        <polygon points="340,275 410,280 430,315 350,315" />
                        <text x="385" y="300">닭발</text>
                    </g>
                </svg>
            </div>
            `;
        }
    }
}

window.MeatMap = MeatMap;
