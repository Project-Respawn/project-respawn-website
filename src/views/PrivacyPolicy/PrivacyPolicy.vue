<template>
    <div class="privacy-container mx-auto">
        <h1>🔒 Data Privacy & Encryption Flowchart</h1>
        <p style="text-align: center; color: #7f8c8d; margin-bottom: 30px;">
            How your data is protected • Hover over boxes for more details
        </p>
        
        <div class="flowchart">
            <!-- START -->
            <div class="step step-start">
                <div class="step-title">START</div>
                <div class="step-description">You upload a photo + GPS location to Project Respawn Gaming</div>
            </div>
            
            <div class="arrow">↓</div>
            
            <!-- AI VALIDATION -->
            <div class="step step-decision">
                <div class="step-title">⚙️ AI VALIDATION CHECK</div>
                <div class="step-description">
                    Is GPS location valid?<br>
                    Does photo match location?<br>
                    Is it a duplicate?
                </div>
            </div>
            
            <div style="display: flex; gap: 20px; margin: 10px 0;">
                <div style="flex: 1; text-align: center;">
                    <div class="arrow">↙️ NORMAL</div>
                </div>
                <div style="flex: 1; text-align: center;">
                    <div class="arrow">↘️ CRISIS</div>
                </div>
            </div>
            
            <!-- NORMAL PATH -->
            <div style="display: flex; gap: 20px;">
                <div style="flex: 1;">
                    <div class="step step-normal">
                        <div class="step-title">🔐 ENCRYPT</div>
                        <div class="step-description">Photo encrypted with AES-256 (military-grade)</div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-normal">
                        <div class="step-title">💾 STORE</div>
                        <div class="step-description">Encrypted stored in secure database</div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-normal">
                        <div class="step-title">👤 YOU CAN ACCESS</div>
                        <div class="step-description">Only YOU with your ID + fingerprint/password</div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-normal">
                        <div class="step-title">🔒 PROJECT RESPAWN CANNOT SEE</div>
                        <div class="step-description">
                            ✓ We see tokens earned<br>
                            ✗ We CANNOT see your photos<br>
                            (No encryption key for us)
                        </div>
                    </div>
                </div>
                
                <!-- CRISIS PATH -->
                <div style="flex: 1;">
                    <div class="step step-crisis">
                        <div class="step-title">🚨 CRISIS DETECTED</div>
                        <div class="step-description">Self-harm or crisis indicators found</div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-crisis">
                        <div class="step-title">⚡ BREAK-GLASS PROTOCOL</div>
                        <div class="step-description">Emergency: We decrypt to assess risk (exception only)</div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-crisis">
                        <div class="step-title">👁️ SAFETY TEAM REVIEWS</div>
                        <div class="step-description">Immediate review of what happened</div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-resource">
                        <div class="step-title">💬 OFFER RESOURCES</div>
                        <div class="step-description">
                            Crisis hotline: 116 123<br>
                            Text: SHOUT to 85258<br>
                            Mental health support info
                        </div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-monitor">
                        <div class="step-title">📞 FOLLOW-UP</div>
                        <div class="step-description">Check-in after 12-24 hours</div>
                    </div>
                    
                    <div class="arrow">↓</div>
                    
                    <div class="step step-monitor">
                        <div class="step-title">🔄 RE-ENCRYPT</div>
                        <div class="step-description">Your data re-encrypted. Privacy restored.</div>
                    </div>
                </div>
            </div>
            
            <div class="arrow">↓</div>
            
            <!-- END -->
            <div class="step step-end">
                <div class="step-title">✓ COMPLETE</div>
                <div class="step-description">Your data handled safely & securely</div>
            </div>
        </div>
        
        <!-- LEGEND -->
        <div class="legend">
            <div class="legend-title">📋 What Each Color Means:</div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ADD8E6;"></div>
                <span><strong>Light Blue:</strong> Start/End points</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #FFFF99;"></div>
                <span><strong>Yellow:</strong> Decision/Check point</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #90EE90;"></div>
                <span><strong>Green:</strong> Normal, safe path</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #FF6B6B;"></div>
                <span><strong>Red:</strong> Crisis detected</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #FFB366;"></div>
                <span><strong>Orange:</strong> Support/Resources offered</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #DDA0DD;"></div>
                <span><strong>Purple:</strong> Monitoring/Following up</span>
            </div>
        </div>        
        <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-left: 4px solid #3498db; border-radius: 6px;">
            <strong>🎯 Bottom Line:</strong> Your photos are encrypted by default. Only you can see them. We ONLY break encryption if we think you're in danger and we log everything.
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped src="./PrivacyPolicy.css"></style>