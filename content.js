// 等待页面加载完成后初始化
window.addEventListener('load', () => {
    setTimeout(initializeHelper, 1000);
});

// 初始化助手
function initializeHelper() {
    // 检查是否在优惠券页面
    if (!window.location.href.includes('/merchantOffers/offer-hub')) {
        return;
    }
    
    // 添加浮动按钮
    addFloatingButton();
}

// 添加浮动按钮
function addFloatingButton() {
    // 创建浮动容器
    const floatingDiv = document.createElement('div');
    floatingDiv.id = 'chase-offer-helper';
    floatingDiv.style.cssText = `
        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 10000;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-family: system-ui;
        min-width: 200px;
    `;

    // 创建标题容器（用于放置标题和关闭按钮）
    const titleContainer = document.createElement('div');
    titleContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 10px;
    `;

    // 创建标题
    const title = document.createElement('div');
    title.textContent = 'Chase Offer Helper';
    title.style.cssText = `
        font-size: 14px;
        font-weight: bold;
        color: #2c2c2c;
    `;

    // 创建关闭按钮
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: #666;
        font-size: 18px;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        line-height: 1;
    `;
    closeButton.addEventListener('click', () => {
        floatingDiv.remove();
    });

    // 组装标题容器
    titleContainer.appendChild(title);
    titleContainer.appendChild(closeButton);

    // 创建进度显示容器
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        display: none;
        flex-direction: column;
        gap: 5px;
        width: 100%;
    `;

    // 创建数量统计
    const progressText = document.createElement('div');
    progressText.style.cssText = `
        font-size: 12px;
        color: #666;
        text-align: center;
    `;

    // 创建进度条
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background-color: #eee;
        border-radius: 2px;
        overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
        width: 0%;
        height: 100%;
        background-color: #117ACA;
        transition: width 0.3s ease;
    `;

    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressText);
    progressContainer.appendChild(progressBar);

    // 创建按钮
    const button = document.createElement('button');
    button.textContent = 'Add All Offers';
    button.style.cssText = `
        padding: 8px 16px;
        background-color: #117ACA;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
    `;

    // 添加鼠标悬停效果
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#0e69b0';
    });
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#117ACA';
    });

    // 添加点击事件
    button.addEventListener('click', startAddingOffers);

    // 组装浮动窗口（新的顺序）
    floatingDiv.appendChild(titleContainer);
    floatingDiv.appendChild(progressContainer);
    floatingDiv.appendChild(button);

    // 添加到页面
    document.body.appendChild(floatingDiv);
    console.log('浮动按钮添加成功');
}

async function startAddingOffers() {
    const floatingDiv = document.querySelector('#chase-offer-helper');
    const titleContainer = floatingDiv.querySelector('div:first-child');
    const progressContainer = floatingDiv.querySelector('div:nth-child(2)');
    const button = floatingDiv.querySelector('button:last-child');
    const progressText = progressContainer.firstChild;
    const progressFill = progressContainer.lastChild.firstChild;
    
    if (button.disabled) {
        return;
    }

    // 创建动态省略号
    let dots = '';
    let dotInterval;

    try {
        button.disabled = true;
        button.style.display = 'none';
        progressContainer.style.display = 'flex';
        progressText.textContent = '0 offers added - Adding offers';
        progressFill.style.width = '0%';
        
        // 启动动态省略号
        dotInterval = setInterval(() => {
            dots = dots.length >= 3 ? '' : dots + '.';
            const currentText = progressText.textContent.split(' - ')[0];
            progressText.textContent = `${currentText} - Adding offers${dots}`;
        }, 500);
        
        const addedCount = await processOffers((current) => {
            // 更新已添加数量，保持动态省略号
            const currentDots = progressText.textContent.split(' - ')[1].replace('Adding offers', '');
            progressText.textContent = `${current} offers added - Adding offers${currentDots}`;
        });

        // 停止动态省略号
        clearInterval(dotInterval);
        
        // 显示完成状态
        progressText.textContent = `${addedCount} offers added`;
        progressFill.style.width = '100%';
        
        await delay(1000); // 显示完成状态1秒
        alert(`Complete! Successfully added ${addedCount} offers.`);

    } catch (error) {
        console.error('添加过程出错:', error);
        clearInterval(dotInterval);
        alert('An error occurred. Please refresh the page and try again.');
    } finally {
        // 清理所有状态
        clearInterval(dotInterval);
        
        // 移除所有旧的UI元素
        while (floatingDiv.children.length > 1) {
            floatingDiv.lastChild.remove();
        }
        
        // 重新创建并添加按钮
        const newButton = document.createElement('button');
        newButton.textContent = 'Add All Offers';
        newButton.style.cssText = `
            padding: 8px 16px;
            background-color: #117ACA;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
        `;
        newButton.addEventListener('mouseover', () => {
            newButton.style.backgroundColor = '#0e69b0';
        });
        newButton.addEventListener('mouseout', () => {
            newButton.style.backgroundColor = '#117ACA';
        });
        newButton.addEventListener('click', startAddingOffers);
        
        floatingDiv.appendChild(newButton);
    }
}

// 查找第一个未添加的优惠券
function findFirstUnofficialOffer() {
    const allElements = document.querySelectorAll('*');
    const offerCards = Array.from(allElements).filter(el => {
        const text = el.textContent || '';
        return (
            (text.includes('cash back') || text.includes('% back')) &&
            (text.includes('left') || text.includes('Last day')) &&
            el.querySelector('img')
        );
    });
    
    for (const card of offerCards) {
        try {
            const hasCheckmark = Array.from(card.querySelectorAll('*')).some(el => {
                const style = window.getComputedStyle(el);
                return el.textContent === '✓' || 
                       style.color.includes('rgb(0, 128') || 
                       el.innerHTML.includes('checkmark');
            });

            if (!hasCheckmark) {
                const addButton = Array.from(card.querySelectorAll('button, [role="button"]')).find(el => {
                    const style = window.getComputedStyle(el);
                    return el.textContent.includes('+') || 
                           style.backgroundColor.includes('rgb(17, 122, 202)') || 
                           el.innerHTML.includes('add');
                });

                if (addButton && !addButton.disabled) {
                    return addButton;
                }
            }
        } catch (error) {
            console.error('处理卡片时出错:', error);
        }
    }
    
    return null;
}

// 处理优惠券添加
async function processOffers(onProgress) {
    let addedCount = 0;
    const originalURL = window.location.href;
    
    while (true) {
        try {
            if (window.location.href !== originalURL) {
                window.history.back();
                await delay(1000);
                continue;
            }

            const button = findFirstUnofficialOffer();
            if (!button) {
                break;
            }
            
            if (button.disabled) {
                continue;
            }
            
            button.click();
            addedCount++;
            
            if (onProgress) {
                onProgress(addedCount);
            }
            
            await delay(3000);

        } catch (error) {
            console.error('添加优惠券失败:', error);
            break;
        }
    }

    if (window.location.href !== originalURL) {
        window.history.back();
    }

    return addedCount;
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 输出初始化日志
console.log('Chase Offer Helper 已加载'); 