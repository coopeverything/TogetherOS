# Email to Hostinger Support - Security Incident Report

**Date:** December 11, 2025
**Subject:** Security Incident - Unauthorized Software Installation on VPS (Dec 6, 2025)

---

## Email Text (Copy Below)

---

**To:** Hostinger Support
**Subject:** Security Incident Report - Unauthorized Software Installation on VPS - Account Investigation Requested

Dear Hostinger Security Team,

I am writing to report a security incident on my VPS and request an investigation into potential unauthorized access to my hosting account.

**VPS Details:**
- Server IP: 72.60.27.167
- Hostname: continentjump
- Account: [Your Hostinger account email]

**Incident Summary:**

On December 11, 2025, while investigating recurring server instability, I discovered two unauthorized software components that were installed on December 6, 2025 between approximately 09:00-10:30 UTC:

1. **MeshAgent** (MeshCentral remote access tool)
   - Location: `/usr/local/mesh_services/meshagent`
   - Service: `/usr/lib/systemd/system/meshagent.service`
   - Connecting to: 45.93.8.88 (ALEXHOST SRL, Amsterdam)
   - This IP is NOT affiliated with Hostinger

2. **rsyslo** (typosquatting "rsyslog" - fake "AV Agent")
   - Location: `/usr/local/rsyslo/rsyslo`
   - Service: `/etc/systemd/system/rsyslo.service`
   - Binary was UPX-packed (common malware obfuscation)

**Key Finding - No SSH Access During Installation:**

I reviewed `/var/log/auth.log` for December 6, 2025, and found NO SSH logins during the 09:00-10:30 installation window. The only SSH sessions were from my known IP addresses at different times.

This suggests the software was installed through either:
1. The Hostinger control panel (hPanel) or API
2. Compromise of my Hostinger account credentials
3. A vulnerability in Hostinger's infrastructure

**Questions for Investigation:**

1. Can you review activity logs for my Hostinger account on December 6, 2025, specifically between 09:00-10:30 UTC?

2. Were there any logins to my hPanel account from unusual IP addresses or locations?

3. Is the `clp` user (which has sudo access on my VPS) associated with any Hostinger management processes, and was it used to install software?

4. Have you received other reports of MeshAgent or similar remote access tools being installed on customer VPSes?

5. Was there any Hostinger-initiated maintenance or software deployment on my VPS around that time?

**Actions I Have Taken:**

- Removed both malicious services and binaries
- Cleaned crontab of suspicious entries
- Verified no data exfiltration occurred (single-user database, logs show normal queries only)
- Enabled audit logging for future monitoring
- Planning to rotate all credentials

**Request:**

Please investigate the account access logs and let me know:
1. How this software was installed without SSH access
2. Whether my account was compromised
3. What additional security measures you recommend

I have preserved relevant log excerpts if you need them for investigation.

Thank you for your prompt attention to this security matter.

Best regards,
[Your Name]
[Your Contact Information]

---

## Attachments to Include (Optional)

If Hostinger requests evidence, you can provide:

1. **journalctl output showing installation:**
```
Dec 06 09:08:46 continentjump systemd[1]: Started meshagent.service - meshagent background service.
Dec 06 10:11:30 continentjump systemd[1]: Started rsyslo.service - Rsyslo AV Agent Service.
```

2. **Kernel log showing executable stack warning:**
```
Dec 06 10:11:29 continentjump kernel: process 'usr/local/rsyslo/rsyslo' started with executable stack
```

3. **meshagent.msh configuration (if saved):**
- Shows C2 server: 45.93.8.88
- Server ID hash
- Installation parameters

---

## Notes

- The malware failed to operate successfully (both crashed repeatedly)
- No evidence of data theft was found
- The attack vector remains unknown without Hostinger's cooperation
- Consider enabling 2FA on Hostinger account if not already active
