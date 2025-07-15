// User Detection Utility for LaunchDarkly Context
class UserDetection {
    constructor() {
        this.userAgent = navigator.userAgent;
        this.platform = navigator.platform;
        this.language = navigator.language;
    }

    // Detect device type
    getDeviceType() {
        const ua = this.userAgent.toLowerCase();
        
        if (/tablet|ipad|playbook|silk/i.test(ua)) {
            return 'tablet';
        }
        if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }

    // Detect operating system
    getOperatingSystem() {
        const ua = this.userAgent;
        
        if (/Windows NT/i.test(ua)) {
            if (/Windows NT 10/i.test(ua)) return 'Windows 10+';
            if (/Windows NT 6/i.test(ua)) return 'Windows 7/8';
            return 'Windows';
        }
        if (/Mac OS X/i.test(ua)) {
            const match = ua.match(/Mac OS X (\d+[._]\d+)/);
            return match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
        }
        if (/Android/i.test(ua)) {
            const match = ua.match(/Android (\d+\.\d+)/);
            return match ? `Android ${match[1]}` : 'Android';
        }
        if (/iPhone|iPad|iPod/i.test(ua)) {
            const match = ua.match(/OS (\d+[._]\d+)/);
            return match ? `iOS ${match[1].replace('_', '.')}` : 'iOS';
        }
        if (/Linux/i.test(ua)) return 'Linux';
        if (/CrOS/i.test(ua)) return 'Chrome OS';
        
        return 'Unknown';
    }

    // Detect browser type and version
    getBrowserInfo() {
        const ua = this.userAgent;
        
        // Chrome
        if (/Chrome/i.test(ua) && !/Edge|Edg|OPR/i.test(ua)) {
            const match = ua.match(/Chrome\/(\d+\.\d+)/);
            return {
                name: 'Chrome',
                version: match ? match[1] : 'Unknown'
            };
        }
        
        // Firefox
        if (/Firefox/i.test(ua)) {
            const match = ua.match(/Firefox\/(\d+\.\d+)/);
            return {
                name: 'Firefox',
                version: match ? match[1] : 'Unknown'
            };
        }
        
        // Safari
        if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
            const match = ua.match(/Version\/(\d+\.\d+)/);
            return {
                name: 'Safari',
                version: match ? match[1] : 'Unknown'
            };
        }
        
        // Edge
        if (/Edg/i.test(ua)) {
            const match = ua.match(/Edg\/(\d+\.\d+)/);
            return {
                name: 'Edge',
                version: match ? match[1] : 'Unknown'
            };
        }
        
        // Opera
        if (/OPR/i.test(ua)) {
            const match = ua.match(/OPR\/(\d+\.\d+)/);
            return {
                name: 'Opera',
                version: match ? match[1] : 'Unknown'
            };
        }
        
        return {
            name: 'Unknown',
            version: 'Unknown'
        };
    }

    // Get screen resolution
    getScreenResolution() {
        return {
            width: screen.width,
            height: screen.height,
            ratio: window.devicePixelRatio || 1
        };
    }

    // Get timezone
    getTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            return 'Unknown';
        }
    }

    // Estimate country from timezone (fallback method)
    getEstimatedCountryFromTimezone() {
        const timezone = this.getTimezone();
        const countryMapping = {
            'America/New_York': 'US',
            'America/Los_Angeles': 'US',
            'America/Chicago': 'US',
            'America/Denver': 'US',
            'America/Toronto': 'CA',
            'America/Vancouver': 'CA',
            'Europe/London': 'GB',
            'Europe/Paris': 'FR',
            'Europe/Berlin': 'DE',
            'Europe/Madrid': 'ES',
            'Europe/Rome': 'IT',
            'Europe/Amsterdam': 'NL',
            'Asia/Tokyo': 'JP',
            'Asia/Shanghai': 'CN',
            'Asia/Seoul': 'KR',
            'Asia/Hong_Kong': 'HK',
            'Asia/Singapore': 'SG',
            'Australia/Sydney': 'AU',
            'Australia/Melbourne': 'AU'
        };
        
        return countryMapping[timezone] || 'Unknown';
    }

    // Get country using a free IP geolocation service
    async getCountryFromIP() {
        try {
            // Using ipapi.co (free tier allows 1000 requests per day)
            const response = await fetch('https://ipapi.co/json/', {
                timeout: 3000 // 3 second timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    country: data.country_code || 'Unknown',
                    city: data.city || 'Unknown',
                    region: data.region || 'Unknown'
                };
            }
        } catch (error) {
            console.log('Could not fetch location from IP:', error);
        }
        
        // Fallback to timezone estimation
        return {
            country: this.getEstimatedCountryFromTimezone(),
            city: 'Unknown',
            region: 'Unknown'
        };
    }

    // Generate comprehensive user context for LaunchDarkly
    async generateUserContext(userName = null) {
        const browser = this.getBrowserInfo();
        const screen = this.getScreenResolution();
        const location = await this.getCountryFromIP();
        
        // Create a consistent user key
        const userKey = userName ? 
            `${userName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}` : 
            `anonymous-${this.generateAnonymousId()}`;
        
        return {
            key: userKey,
            name: userName || 'Anonymous Player',
            email: userName ? `${userName.toLowerCase().replace(/\s+/g, '.')}@dino-run.game` : '',
            custom: {
                // Device Information
                deviceType: this.getDeviceType(),
                operatingSystem: this.getOperatingSystem(),
                
                // Browser Information
                browserName: browser.name,
                browserVersion: browser.version,
                
                // Screen Information
                screenWidth: screen.width,
                screenHeight: screen.height,
                screenRatio: screen.ratio,
                
                // Location Information
                country: location.country,
                city: location.city,
                region: location.region,
                timezone: this.getTimezone(),
                language: this.language,
                
                // Game-specific
                gameVersion: '1.0.0',
                firstSession: !this.hasPlayedBefore(),
                sessionId: this.generateSessionId(),
                
                // Technical
                userAgent: this.userAgent,
                platform: this.platform,
                timestamp: new Date().toISOString()
            }
        };
    }

    // Generate anonymous ID for users who don't provide names
    generateAnonymousId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // Generate session ID
    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }

    // Check if user has played before
    hasPlayedBefore() {
        return localStorage.getItem('dinoRunPlayerData') !== null;
    }

    // Save player data
    savePlayerData(userData) {
        const playerData = {
            name: userData.name,
            key: userData.key,
            firstVisit: new Date().toISOString(),
            lastVisit: new Date().toISOString(),
            sessions: 1
        };
        
        const existing = this.getPlayerData();
        if (existing) {
            playerData.firstVisit = existing.firstVisit;
            playerData.sessions = (existing.sessions || 0) + 1;
        }
        
        localStorage.setItem('dinoRunPlayerData', JSON.stringify(playerData));
        return playerData;
    }

    // Get player data
    getPlayerData() {
        try {
            const data = localStorage.getItem('dinoRunPlayerData');
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    // Clear player data (for settings reset)
    clearPlayerData() {
        localStorage.removeItem('dinoRunPlayerData');
    }
}

// Create global instance
window.userDetection = new UserDetection(); 