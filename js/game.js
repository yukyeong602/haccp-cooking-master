// 스마트 마트 마스터 - 게임 메인 컨트롤러

class SmartMartGame {
    constructor() {
        this.studentName = "스마트학생";
        this.currentStage = 0; // 0: Intro, 1..5: Stages, 6: Receipt
        this.score = 0;
        this.stageScores = {
            stage1: 0,
            stage2: 0,
            stage3: 0,
            stage4: 0,
            stage5: 0
        };

        // Stage 1 상태
        this.currentOrderStep = 1;
        this.packedItems = [];

        // Stage 2 상태
        this.inspectorIndex = 0;
        this.inspectorList = [];

        // Stage 3 상태
        this.certIndex = 0;
        this.certList = [];

        // Stage 4 상태
        this.chefOrderIndex = 0;
        this.chefOrders = [];
        this.meatMap = null;

        // Stage 5 상태
        this.goldenBellIndex = 0;
        this.goldenBellQuestions = [];

        this.initDOM();
        this.bindGlobalEvents();
    }

    initDOM() {
        this.el = {
            scoreDisplay: document.getElementById('scoreDisplay'),
            btnCheatSheet: document.getElementById('btnCheatSheet'),
            btnSoundToggle: document.getElementById('btnSoundToggle'),
            soundIcon: document.getElementById('soundIcon'),
            progressSection: document.getElementById('progressSection'),
            progressBarFill: document.getElementById('progressBarFill'),

            // Views
            viewIntro: document.getElementById('view-intro'),
            viewStage1: document.getElementById('view-stage1'),
            viewStage2: document.getElementById('view-stage2'),
            viewStage3: document.getElementById('view-stage3'),
            viewStage4: document.getElementById('view-stage4'),
            viewStage5: document.getElementById('view-stage5'),
            viewReceipt: document.getElementById('view-receipt'),

            // Modals
            feedbackModal: document.getElementById('feedbackModal'),
            feedbackIcon: document.getElementById('feedbackIcon'),
            feedbackTitle: document.getElementById('feedbackTitle'),
            feedbackDesc: document.getElementById('feedbackDesc'),
            feedbackNextBtn: document.getElementById('feedbackNextBtn'),

            cheatSheetModal: document.getElementById('cheatSheetModal'),
            btnCloseCheat: document.getElementById('btnCloseCheat'),
            cheatSheetList: document.getElementById('cheatSheetList'),

            // Intro
            studentNameInput: document.getElementById('studentNameInput'),
            btnStartGame: document.getElementById('btnStartGame'),

            // Stage 1
            stage1Counter: document.getElementById('stage1Counter'),
            targetCategoryName: document.getElementById('targetCategoryName'),
            targetCategoryDesc: document.getElementById('targetCategoryDesc'),
            orderPillsContainer: document.getElementById('orderPillsContainer'),
            shelfItemsGrid: document.getElementById('shelfItemsGrid'),
            cartItemsRow: document.getElementById('cartItemsRow'),
            cartCount: document.getElementById('cartCount'),

            // Stage 2
            stage2Progress: document.getElementById('stage2Progress'),
            inspectorFoodTitle: document.getElementById('inspectorFoodTitle'),
            inspectorQuestion: document.getElementById('inspectorQuestion'),
            inspectorOptionsContainer: document.getElementById('inspectorOptionsContainer'),
            inspectorTipText: document.getElementById('inspectorTipText'),

            // Stage 3
            stage3Progress: document.getElementById('stage3Progress'),
            certQuizClue: document.getElementById('certQuizClue'),
            certBadgesGrid: document.getElementById('certBadgesGrid'),

            // Stage 4
            stage4Progress: document.getElementById('stage4Progress'),
            chefDishTitle: document.getElementById('chefDishTitle'),
            chefOrderClue: document.getElementById('chefOrderClue'),
            meatMapContainer: document.getElementById('meatMapContainer'),

            // Stage 5
            stage5Progress: document.getElementById('stage5Progress'),
            goldenQuestionText: document.getElementById('goldenQuestionText'),
            goldenChoicesGrid: document.getElementById('goldenChoicesGrid'),

            // Receipt
            receiptRankTitle: document.getElementById('receiptRankTitle'),
            receiptDate: document.getElementById('receiptDate'),
            receiptCustomer: document.getElementById('receiptCustomer'),
            resStage1: document.getElementById('resStage1'),
            resStage2: document.getElementById('resStage2'),
            resStage3: document.getElementById('resStage3'),
            resStage4: document.getElementById('resStage4'),
            resStage5: document.getElementById('resStage5'),
            receiptTotalScore: document.getElementById('receiptTotalScore'),
            btnRestartGame: document.getElementById('btnRestartGame'),
            btnPrintReceipt: document.getElementById('btnPrintReceipt')
        };
    }

    bindGlobalEvents() {
        // 사운드 토글
        this.el.btnSoundToggle.addEventListener('click', () => {
            const isMuted = window.soundEngine.toggleMute();
            this.el.soundIcon.textContent = isMuted ? '🔇' : '🔊';
            this.el.btnSoundToggle.classList.toggle('muted', isMuted);
        });

        // 교사용 치트시트 열기/닫기
        this.el.btnCheatSheet.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playPop();
            this.openCheatSheet();
        });
        this.el.btnCloseCheat.addEventListener('click', () => {
            this.el.cheatSheetModal.classList.remove('active');
        });
        this.el.cheatSheetModal.addEventListener('click', (e) => {
            if (e.target === this.el.cheatSheetModal) {
                this.el.cheatSheetModal.classList.remove('active');
            }
        });

        // 게임 시작
        this.el.btnStartGame.addEventListener('click', () => {
            const name = this.el.studentNameInput.value.trim();
            if (name) this.studentName = name;
            if (window.soundEngine) window.soundEngine.playPop();
            this.startStage1();
        });

        // 결과 영수증에서 다시하기 & 인쇄
        this.el.btnRestartGame.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.playPop();
            this.resetGame();
        });
        this.el.btnPrintReceipt.addEventListener('click', () => {
            window.print();
        });
    }

    openCheatSheet() {
        const data = window.GAME_DATA.teacherCheatSheet;
        this.el.cheatSheetList.innerHTML = data.summaryPoints.map(p => `
            <div class="cheat-item">
                <h4>${p.topic}</h4>
                <p>${p.content}</p>
            </div>
        `).join('');
        this.el.cheatSheetModal.classList.add('active');
    }

    addScore(points, stageKey) {
        this.score += points;
        if (stageKey) {
            this.stageScores[stageKey] += points;
        }
        this.el.scoreDisplay.textContent = `${this.score} / 520점`;
    }

    switchView(viewElement) {
        document.querySelectorAll('.stage-view').forEach(v => v.classList.remove('active'));
        viewElement.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateProgress(stageNum) {
        this.currentStage = stageNum;
        if (stageNum === 0 || stageNum > 5) {
            this.el.progressSection.style.display = 'none';
            return;
        }
        this.el.progressSection.style.display = 'block';

        const percent = ((stageNum - 1) / 5) * 100 + 10;
        this.el.progressBarFill.style.width = `${percent}%`;

        for (let i = 1; i <= 5; i++) {
            const ind = document.getElementById(`indicator-${i}`);
            if (!ind) continue;
            ind.classList.remove('active', 'completed');
            if (i < stageNum) {
                ind.classList.add('completed');
            } else if (i === stageNum) {
                ind.classList.add('active');
            }
        }
    }

    showFeedback(isCorrect, title, desc, onAction, actionBtnText) {
        const card = this.el.feedbackModal.querySelector('.feedback-card');
        if (card) {
            card.classList.remove('shake');
        }

        if (isCorrect) {
            window.soundEngine.playCorrect();
            this.el.feedbackIcon.textContent = '🎉';
            this.el.feedbackTitle.textContent = title || '정답입니다! 딩동댕!';
            this.el.feedbackTitle.className = 'feedback-title correct';
            this.el.feedbackNextBtn.textContent = actionBtnText || '다음 단계로 진행 →';
            this.el.feedbackNextBtn.className = 'feedback-next-btn';
        } else {
            // 강력한 오답 부저음 재생 및 카드 흔들림 애니메이션
            window.soundEngine.playWrong();
            if (card) {
                void card.offsetWidth; // reflow to restart animation
                card.classList.add('shake');
            }
            this.el.feedbackIcon.textContent = '🚨';
            this.el.feedbackTitle.textContent = title || '땡! 오답입니다!';
            this.el.feedbackTitle.className = 'feedback-title wrong';
            this.el.feedbackNextBtn.textContent = actionBtnText || '↩️ 문제로 되돌아가기 (다시 풀기)';
            this.el.feedbackNextBtn.className = 'feedback-next-btn retry-btn';
        }

        this.el.feedbackDesc.innerHTML = desc;
        this.el.feedbackModal.classList.add('active');

        const nextHandler = () => {
            this.el.feedbackModal.classList.remove('active');
            if (card) card.classList.remove('shake');
            this.el.feedbackNextBtn.removeEventListener('click', nextHandler);
            if (onAction) onAction();
        };

        this.el.feedbackNextBtn.addEventListener('click', nextHandler);
    }

    /* =================================================================
       STAGE 1: 식품 안전 장보기 순서 챌린지
       순서: 1.실온 보관 제품 -> 2.농산물 -> 3.냉장·냉동 식품 -> 4.육류 -> 5.어패류
       ================================================================= */
    startStage1() {
        this.updateProgress(1);
        this.switchView(this.el.viewStage1);
        this.currentOrderStep = 1;
        this.packedItems = [];

        this.renderStage1();
    }

    renderStage1() {
        const orderData = window.GAME_DATA.shoppingOrder;
        const currentStepData = orderData.steps.find(s => s.step === this.currentOrderStep);

        this.el.stage1Counter.textContent = `순서 ${this.currentOrderStep} / 5`;
        if (currentStepData) {
            this.el.targetCategoryName.textContent = `현재 담아야 할 단계: [${currentStepData.category}]`;
            this.el.targetCategoryDesc.textContent = currentStepData.desc;
        }

        // 5단계 뱃지 인디케이터
        this.el.orderPillsContainer.innerHTML = orderData.steps.map(s => {
            let cls = 'order-pill';
            if (s.step < this.currentOrderStep) cls += ' done';
            if (s.step === this.currentOrderStep) cls += ' current';
            return `<span class="${cls}">${s.step}. ${s.category}</span>`;
        }).join('');

        // 카트 렌더링
        this.el.cartCount.textContent = `담은 상품: ${this.packedItems.length}개`;
        if (this.packedItems.length === 0) {
            this.el.cartItemsRow.innerHTML = `<span style="color:#B45309; font-size:0.85rem; align-self:center;">카트가 비어있습니다. 올바른 순서의 상품을 위 진열대에서 클릭하세요!</span>`;
        } else {
            this.el.cartItemsRow.innerHTML = this.packedItems.map(item => `
                <div class="cart-chip">
                    <span>${item.icon}</span>
                    <span>${item.name}</span>
                </div>
            `).join('');
        }

        // 진열대 상품 렌더링 (순서 섞기)
        this.el.shelfItemsGrid.innerHTML = orderData.pool.map(item => {
            const isPacked = this.packedItems.some(p => p.id === item.id);
            return `
                <div class="shelf-item-card ${isPacked ? 'packed' : ''}" data-item-id="${item.id}">
                    <div class="shelf-item-icon">${item.icon}</div>
                    <div class="shelf-item-name">${item.name}</div>
                    <div class="shelf-item-temp">보관: ${item.temp}</div>
                </div>
            `;
        }).join('');

        // 진열대 아이템 클릭 이벤트
        this.el.shelfItemsGrid.querySelectorAll('.shelf-item-card').forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.getAttribute('data-item-id');
                const item = orderData.pool.find(p => p.id === itemId);
                if (!item) return;

                const targetStep = orderData.steps.find(s => s.step === this.currentOrderStep);

                if (item.category === targetStep.category) {
                    // 정답! 카트에 담기
                    window.soundEngine.playCartDrop();
                    this.packedItems.push(item);
                    this.addScore(20, 'stage1');

                    // 다음 단계로 전환
                    this.currentOrderStep++;
                    if (this.currentOrderStep > 5) {
                        // Stage 1 완료!
                        setTimeout(() => {
                            this.showFeedback(
                                true,
                                "Stage 1 클리어! 완벽한 장보기 순서!",
                                `<strong>식품 안전 장보기 5단계 완성 (100/100점):</strong><br>
                                 1.실온 보관(쌀·라면) &rarr; 2.농산물(채소·과일) &rarr; 3.냉장·냉동 &rarr; 4.육류 &rarr; 5.어패류<br><br>
                                 식중독균 번식 위험이 높은 육류와 어패류를 마지막에 담아 안전하게 장을 보았습니다!`,
                                () => this.startStage2(),
                                "Stage 2 식재료 감별소로 이동 →"
                            );
                        }, 300);
                    } else {
                        this.renderStage1();
                    }
                } else {
                    // 순서 틀림: 부저음 및 진열대로 되돌아가기
                    this.showFeedback(
                        false,
                        "🚨 땡! 장보기 순서가 맞지 않아요!",
                        `선택하신 <strong>[${item.name}]</strong>은(는) <em>${item.category}</em> 상품입니다.<br>
                         현재 담아야 하는 순서는 <strong>${this.currentOrderStep}단계 [${targetStep.category}]</strong>입니다.<br>
                         <br>💡 <strong>이유:</strong> ${targetStep.desc}`,
                        () => {
                            this.renderStage1();
                        },
                        "↩️ 진열대로 되돌아가기"
                    );
                }
            });
        });
    }

    /* =================================================================
       STAGE 2: 신선 식재료 감별 탐정소
       ================================================================= */
    startStage2() {
        this.updateProgress(2);
        this.switchView(this.el.viewStage2);
        this.inspectorList = [...window.GAME_DATA.ingredientInspector];
        this.inspectorIndex = 0;
        this.renderStage2();
    }

    renderStage2() {
        const item = this.inspectorList[this.inspectorIndex];
        if (!item) {
            this.startStage3();
            return;
        }

        this.el.stage2Progress.textContent = `${this.inspectorIndex + 1} / ${this.inspectorList.length}`;
        this.el.inspectorFoodTitle.textContent = `🔍 ${item.title}`;
        this.el.inspectorQuestion.textContent = item.question;
        this.el.inspectorTipText.textContent = item.tip;

        // 2개 선택지 렌더링
        this.el.inspectorOptionsContainer.innerHTML = item.options.map((opt, idx) => `
            <div class="inspector-option-card" data-idx="${idx}">
                <div class="option-badge-wrap">
                    <span class="option-letter">${idx === 0 ? 'A' : 'B'}</span>
                    <span style="font-size:0.8rem; color:#6B7280; font-weight:700;">식재료 상태 확인</span>
                </div>
                <div class="option-text-body">${opt.text}</div>
                <button class="option-select-btn">이 식재료 선택하기</button>
            </div>
        `).join('');

        this.el.inspectorOptionsContainer.querySelectorAll('.inspector-option-card').forEach(card => {
            card.addEventListener('click', () => {
                const idx = parseInt(card.getAttribute('data-idx'));
                const chosen = item.options[idx];
                if (chosen.isCorrect) {
                    this.addScore(20, 'stage2');
                    const isLast = this.inspectorIndex === this.inspectorList.length - 1;
                    this.showFeedback(
                        true,
                        "명탐정의 올바른 식재료 감별!",
                        chosen.feedback,
                        () => {
                            this.inspectorIndex++;
                            if (this.inspectorIndex >= this.inspectorList.length) {
                                this.startStage3();
                            } else {
                                this.renderStage2();
                            }
                        },
                        isLast ? "Stage 3 인증마크 코너로 이동 →" : "다음 감별 문제로 이동 →"
                    );
                } else {
                    this.showFeedback(
                        false,
                        "🚨 땡! 잘못된 선택입니다!",
                        chosen.feedback + `<br><br>💡 <strong>핵심 포인트:</strong> ${item.tip}`,
                        () => {
                            // 오답 후 다시 풀 수 있도록 재렌더링
                            this.renderStage2();
                        },
                        "↩️ 감별 문제로 되돌아가기 (다시 풀기)"
                    );
                }
            });
        });
    }

    /* =================================================================
       STAGE 3: 친환경·안전 인증 마크 & 로컬푸드 스피드 매칭
       ================================================================= */
    startStage3() {
        this.updateProgress(3);
        this.switchView(this.el.viewStage3);
        // 5문항 선정
        this.certList = [...window.GAME_DATA.certifications].sort(() => 0.5 - Math.random()).slice(0, 5);
        this.certIndex = 0;
        this.renderStage3();
    }

    renderStage3() {
        const currentTarget = this.certList[this.certIndex];
        if (!currentTarget) {
            this.startStage4();
            return;
        }

        this.el.stage3Progress.textContent = `${this.certIndex + 1} / ${this.certList.length}`;
        this.el.certQuizClue.textContent = currentTarget.quizClue;

        // 전체 인증 마크 목록을 셔플하여 보기로 제공
        const allBadges = [...window.GAME_DATA.certifications].sort(() => 0.5 - Math.random());

        this.el.certBadgesGrid.innerHTML = allBadges.map(badge => `
            <div class="cert-badge-choice" data-id="${badge.id}">
                <div class="cert-icon-circle" style="background-color: ${badge.color}15; color: ${badge.color};">
                    ${badge.icon}
                </div>
                <div class="cert-choice-info">
                    <h4>${badge.name}</h4>
                    <p>${badge.keyword}</p>
                </div>
            </div>
        `).join('');

        this.el.certBadgesGrid.querySelectorAll('.cert-badge-choice').forEach(choice => {
            choice.addEventListener('click', () => {
                const choiceId = choice.getAttribute('data-id');
                if (choiceId === currentTarget.id) {
                    this.addScore(20, 'stage3');
                    const isLast = this.certIndex === this.certList.length - 1;
                    this.showFeedback(
                        true,
                        `정답! [${currentTarget.name}]`,
                        `<strong>${currentTarget.name}:</strong><br>${currentTarget.desc}`,
                        () => {
                            this.certIndex++;
                            if (this.certIndex >= this.certList.length) {
                                this.startStage4();
                            } else {
                                this.renderStage3();
                            }
                        },
                        isLast ? "Stage 4 셰프의 정육점으로 이동 →" : "다음 인증마크 문제로 이동 →"
                    );
                } else {
                    const wrongItem = window.GAME_DATA.certifications.find(c => c.id === choiceId);
                    this.showFeedback(
                        false,
                        "🚨 땡! 인증 마크가 일치하지 않습니다!",
                        `선택하신 <strong>[${wrongItem.name}]</strong>은(는) "${wrongItem.desc}"입니다.<br><br>
                         다시 질문의 단서를 읽고 정답 마크를 찾아보세요!`,
                        () => {
                            this.renderStage3();
                        },
                        "↩️ 인증마크 선택으로 되돌아가기"
                    );
                }
            });
        });
    }

    /* =================================================================
       STAGE 4: 셰프의 정육점 (부위별 명칭과 용도)
       ================================================================= */
    startStage4() {
        this.updateProgress(4);
        this.switchView(this.el.viewStage4);
        this.chefOrders = [...window.GAME_DATA.chefOrders].sort(() => 0.5 - Math.random()).slice(0, 4);
        this.chefOrderIndex = 0;

        if (!this.meatMap) {
            this.meatMap = new window.MeatMap('meatMapContainer', (partName, partId, animalKey) => {
                this.handleMeatPartSelected(partName, partId, animalKey);
            });
        }

        this.renderStage4();
    }

    renderStage4() {
        const order = this.chefOrders[this.chefOrderIndex];
        if (!order) {
            this.startStage5();
            return;
        }

        this.el.stage4Progress.textContent = `${this.chefOrderIndex + 1} / ${this.chefOrders.length}`;
        this.el.chefDishTitle.textContent = `🍳 ${order.dish}`;
        this.el.chefOrderClue.textContent = order.clue;

        // 해당 동물의 탭으로 자동 렌더링
        this.meatMap.setAnimal(order.animal);
    }

    handleMeatPartSelected(partName, partId, animalKey) {
        const order = this.chefOrders[this.chefOrderIndex];
        if (!order) return;

        // 동물 종류 일치 여부
        if (animalKey !== order.animal) {
            const animalName = window.GAME_DATA.meatGuide[order.animal].animal;
            this.showFeedback(
                false,
                "🚨 땡! 고기 종류를 확인하세요!",
                `현재 주문 요리(<strong>${order.dish}</strong>)는 <strong>${animalName}</strong> 부위가 필요합니다.<br>상단 탭에서 <strong>${animalName}</strong>를 먼저 선택해주세요!`,
                () => {
                    this.renderStage4();
                },
                "↩️ 정육점 다이어그램으로 되돌아가기"
            );
            return;
        }

        // 부위 일치 여부 확인
        const isMatch = order.targetNamesAlt.some(t => partName.includes(t) || t.includes(partName));

        if (isMatch) {
            this.addScore(25, 'stage4');
            const isLast = this.chefOrderIndex === this.chefOrders.length - 1;
            this.showFeedback(
                true,
                `셰프의 극찬! [${partName}] 선택 성공!`,
                `<strong>요리:</strong> ${order.dish}<br>
                 <strong>선택 부위:</strong> ${partName}<br><br>
                 조리 용도에 꼭 맞는 훌륭한 식재료 선택이었습니다!`,
                () => {
                    this.chefOrderIndex++;
                    if (this.chefOrderIndex >= this.chefOrders.length) {
                        this.startStage5();
                    } else {
                        this.renderStage4();
                    }
                },
                isLast ? "Stage 5 최종 도전 골든벨로 이동 →" : "다음 셰프 주문으로 이동 →"
            );
        } else {
            this.showFeedback(
                false,
                `🚨 땡! [${partName}] 부위는 이 요리에 적합하지 않아요`,
                `<strong>힌트:</strong> ${order.clue}<br><br>다이어그램에서 다시 알맞은 부위를 찾아보세요!`,
                () => {
                    this.renderStage4();
                },
                "↩️ 부위 다시 선택하기"
            );
        }
    }

    /* =================================================================
       STAGE 5: 도전 골든벨 퀴즈
       ================================================================= */
    startStage5() {
        this.updateProgress(5);
        this.switchView(this.el.viewStage5);
        this.goldenBellQuestions = [...window.GAME_DATA.goldenBell];
        this.goldenBellIndex = 0;

        this.renderStage5();
    }

    renderStage5() {
        const q = this.goldenBellQuestions[this.goldenBellIndex];
        if (!q) {
            this.showReceipt();
            return;
        }

        this.el.stage5Progress.textContent = `${this.goldenBellIndex + 1} / ${this.goldenBellQuestions.length}`;
        this.el.goldenQuestionText.textContent = q.question;

        this.el.goldenChoicesGrid.innerHTML = q.options.map((opt, idx) => `
            <button class="golden-choice-btn" data-idx="${idx}">
                <span class="choice-index-circle">${idx + 1}</span>
                <span>${opt}</span>
            </button>
        `).join('');

        this.el.goldenChoicesGrid.querySelectorAll('.golden-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const chosenIdx = parseInt(btn.getAttribute('data-idx'));
                if (chosenIdx === q.answer) {
                    this.addScore(25, 'stage5');
                    const isLast = this.goldenBellIndex === this.goldenBellQuestions.length - 1;
                    this.showFeedback(
                        true,
                        "🔔 골든벨 정답입니다! 딩동댕!",
                        `<strong>해설:</strong><br>${q.explanation}`,
                        () => {
                            this.goldenBellIndex++;
                            if (this.goldenBellIndex >= this.goldenBellQuestions.length) {
                                this.showReceipt();
                            } else {
                                this.renderStage5();
                            }
                        },
                        isLast ? "최종 성적표 영수증 발급받기 →" : "다음 골든벨 문제로 이동 →"
                    );
                } else {
                    // 오답 시: 문제를 건너뛰지 않고 부저음과 함께 해당 문제로 되돌아가서 다시 풀게 함!
                    this.showFeedback(
                        false,
                        "🚨 땡! 골든벨 오답입니다!",
                        `선택하신 <strong>[${q.options[chosenIdx]}]</strong>은(는) 정답이 아닙니다.<br><br>
                         💡 <strong>힌트:</strong> 문제를 다시 한 번 꼼꼼히 확인하고 올바른 답을 골라보세요!`,
                        () => {
                            // 인덱스 증가 없이 다시 렌더링
                            this.renderStage5();
                        },
                        "↩️ 골든벨 문제로 되돌아가기 (다시 풀기)"
                    );
                }
            });
        });
    }

    /* =================================================================
       결과 영수증 성적표 화면
       ================================================================= */
    showReceipt() {
        this.updateProgress(6);
        this.switchView(this.el.viewReceipt);
        window.soundEngine.playFanfare();

        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        this.el.receiptDate.textContent = `일시: ${dateStr}`;
        this.el.receiptCustomer.textContent = `쇼퍼: ${this.studentName}`;

        this.el.resStage1.textContent = `완료 (${this.stageScores.stage1} / 100점)`;
        this.el.resStage2.textContent = `완료 (${this.stageScores.stage2} / 120점)`;
        this.el.resStage3.textContent = `완료 (${this.stageScores.stage3} / 100점)`;
        this.el.resStage4.textContent = `완료 (${this.stageScores.stage4} / 100점)`;
        this.el.resStage5.textContent = `완료 (${this.stageScores.stage5} / 100점)`;

        this.el.receiptTotalScore.textContent = `${this.score} / 520점`;

        // 칭호 결정
        let rank = "특급 마스터";
        if (this.score >= 520) rank = "👑 만점 전설의 마스터";
        else if (this.score >= 450) rank = "🥇 전설의 쇼퍼";
        else if (this.score >= 350) rank = "🥈 스마트 베테랑";
        else rank = "🥉 식재료 견습생";

        this.el.receiptRankTitle.textContent = rank;
    }

    resetGame() {
        this.score = 0;
        this.stageScores = { stage1: 0, stage2: 0, stage3: 0, stage4: 0, stage5: 0 };
        this.el.scoreDisplay.textContent = '0 / 520점';
        this.currentStage = 0;
        this.updateProgress(0);
        this.switchView(this.el.viewIntro);
    }
}

// 브라우저 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new SmartMartGame();
});
