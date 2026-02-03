function main(config) {
    // --- 1. DNS 防泄露深度配置 --- 
    const domesticNameservers = [
        "https://doh.pub/dns-query",
        "https://223.5.5.5/dns-query"
    ];
    const foreignNameservers = [
        "https://1.1.1.1/dns-query",
        "https://8.8.4.4/dns-query"
    ];

    config["dns"] = {
        "enable": true,
        "listen": "0.0.0.0:1053",
        "ipv6": false, // 禁用 IPv6 解决大部分泄露问题 
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "respect-rules": true, // 必须开启：DNS 查询将遵循路由规则 
        "default-nameserver": ["119.29.29.29", "223.5.5.5"],
        "nameserver": [...foreignNameservers], // 默认走境外 DoH [cite: 4, 30]
        "proxy-server-nameserver": [...domesticNameservers], // 解析节点域名 [cite: 4, 30]
        "nameserver-policy": {
            "geosite:private,cn": domesticNameservers // 国内域名强制走国内 DNS [cite: 4, 30]
        },
        "fake-ip-filter": [
            "+.lan", "+.local", "+.msftconnecttest.com", "+.msftncsi.com",
            "localhost.ptlogin2.qq.com", "time.*.com", "pool.ntp.org",
            "localhost.work.weixin.qq.com", "+.in-addr.arpa", "+.ip6.arpa"
        ]
    };

    // --- 2. 策略组扩展 --- 
    const groupBase = {
        "interval": 300,
        "timeout": 3000,
        "lazy": true,
        "include-all": true
    };

    config["proxy-groups"] = [
        {
            ...groupBase,
            "name": "节点选择",
            "type": "select",
            "proxies": ["延迟选优", "DIRECT"], // [cite: 16, 32]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg"
        },
        {
            ...groupBase,
            "name": "延迟选优",
            "type": "url-test",
            "url": "http://www.gstatic.com/generate_204",
            "tolerance": 200, // [cite: 17, 32]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg"
        },
        {
            ...groupBase,
            "name": "AI",
            "type": "select",
            "proxies": ["节点选择", "延迟选优"], // [cite: 20]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg"
        },
        {
            ...groupBase,
            "name": "YouTube",
            "type": "select",
            "proxies": ["节点选择", "延迟选优"], // [cite: 18]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/youtube.svg"
        },
        {
            ...groupBase,
            "name": "Netflix",
            "type": "select",
            "proxies": ["节点选择", "延迟选优"], // [cite: 19]
            "icon": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/icon/netflix.svg"
        },
        {
            ...groupBase,
            "name": "电报消息",
            "type": "select",
            "proxies": ["节点选择", "延迟选优"], // [cite: 19]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg"
        },
        {
            ...groupBase,
            "name": "谷歌服务",
            "type": "select",
            "proxies": ["节点选择", "DIRECT"], // [cite: 18]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/google.svg"
        },
        {
            ...groupBase,
            "name": "微软服务",
            "type": "select",
            "proxies": ["DIRECT", "节点选择"], // [cite: 20]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/microsoft.svg"
        },
        {
            ...groupBase,
            "name": "苹果服务",
            "type": "select",
            "proxies": ["DIRECT", "节点选择"], // [cite: 21]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/apple.svg"
        },
        {
            ...groupBase,
            "name": "广告过滤",
            "type": "select",
            "proxies": ["REJECT", "DIRECT"], // [cite: 23]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg"
        },
        {
            ...groupBase,
            "name": "漏网之鱼",
            "type": "select",
            "proxies": ["节点选择", "DIRECT"], // [cite: 24]
            "icon": "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg"
        }
    ];

    // --- 3. 规则映射优化 ---
    const ruleProviderCommon = { "type": "http", "format": "yaml", "interval": 86400 };
    config["rule-providers"] = {
        "reject": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt" },
        "proxy": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt" },
        "direct": { ...ruleProviderCommon, "behavior": "domain", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt" },
        "ai": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/AI.txt" },
        "youtube": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/YouTube.txt" },
        "netflix": { ...ruleProviderCommon, "behavior": "classical", "url": "https://fastly.jsdelivr.net/gh/xiaolin-007/clash@main/rule/Netflix.txt" },
        "telegram": { ...ruleProviderCommon, "behavior": "ipcidr", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt" },
        "cncidr": { ...ruleProviderCommon, "behavior": "ipcidr", "url": "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt" }
    };

    config["rules"] = [
        "RULE-SET,reject,广告过滤",
        "RULE-SET,ai,AI",
        "RULE-SET,youtube,YouTube",
        "RULE-SET,netflix,Netflix",
        "RULE-SET,telegram,电报消息,no-resolve",
        "RULE-SET,proxy,节点选择",
        "RULE-SET,direct,DIRECT",
        "RULE-SET,cncidr,DIRECT,no-resolve", // 配合 no-resolve 减少泄露 
        "GEOIP,CN,DIRECT,no-resolve",
        "MATCH,漏网之鱼" // 漏网之鱼统一处理 
    ];

    // --- 4. 节点属性注入 --- 
    if (config.proxies) {
        config.proxies.forEach(p => { p.udp = true; }); // 强制开启 UDP [cite: 26, 37, 38]
    }

    return config;
}
