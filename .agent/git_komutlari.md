# GitHub Sık Kullanılan Komutlar

Bu dosya, projeyi geliştirirken sıkça ihtiyaç duyacağınız temel Git komutlarını içerir.

## 1. Durumu Kontrol Etme
Hangi dosyaların değiştiğini görmek için:
```bash
git status
```

## 2. Değişiklikleri Ekleme (Sahneleme)
Tüm değişen dosyaları bir sonraki işlem (commit) için hazırlamak adına:
```bash
git add .
```
*(Sadece belirli bir dosyayı eklemek isterseniz: `git add dosya_adi`)*

## 3. Değişiklikleri Kaydetme (Commit)
Eklediğiniz dosyaları bir mesajla birlikte kaydetmek için:
```bash
git commit -m "Yapılan değişikliğin kısa özeti"
```
*Örnek: `git commit -m "Giriş rkranı tasarımı güncellendi"`*

## 4. GitHub'a Gönderme (Push)
Bilgisayarınızdaki değişiklikleri GitHub deposuna yüklemek için:
```bash
git push
```
*(Eğer ana dalınız `main` ise ve hata alırsanız: `git push origin main`)*

## 5. Güncellemeleri Çekme (Pull)
GitHub'daki veya başka bir bilgisayardaki değişiklikleri bu bilgisayara indirmek için:
```bash
git pull
```

---

### Hızlı İş Akışı Özeti
Sırasıyla şu komutları çalıştırarak değişikliklerinizi güncelleyebilirsiniz:

1. `git status` (Kontrol et)
2. `git add .` (Hepsini seç)
3. `git commit -m "Yaptığım değişiklik"` (Kaydet)
4. `git push` (Gönder)
