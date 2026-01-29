export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">
          מדיניות פרטיות
        </h1>
        
        <div className="space-y-10 text-foreground px-2 md:px-4">
          {/* עקרונות אחסון */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              🔐 אבטחת המידע
            </h2>
            <div className="space-y-3 text-base md:text-lg leading-relaxed">
              <p>
                כל משתמש מקבל <strong>מזהה ייחודי מוצפן</strong> במערכת האימות המאובטחת.
              </p>
              <p>
                הנתונים האישיים שלך (יומן מסחר, תיק השקעות, חישובים) נשמרים 
                במסלולים פרטיים ומוגנים במערכת אחסון מוצפנת.
              </p>
              <div className="bg-primary/10 border-r-4 border-primary p-5 rounded-lg space-y-2">
                <p><strong>גישה לנתונים:</strong></p>
                <p>• <strong>משתמשים באפליקציה</strong> - כל משתמש רואה אך ורק את הנתונים שלו. אף משתמש לא יכול לגשת לנתונים של משתמשים אחרים.</p>
                <p>• <strong>מנהלי המערכת</strong> - יכולים לגשת לנתונים לצורכי ניהול, תחזוקה, תמיכה טכנית וניפוי שגיאות בלבד.</p>
              </div>
            </div>
          </section>

          {/* שימוש במידע */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              📊 שימוש במידע
            </h2>
            <div className="space-y-3 text-base md:text-lg leading-relaxed">
              <p>
                המערכת רשאית לאסוף <strong>נתונים כלליים וסטטיסטיים בלבד</strong>, לדוגמה:
              </p>
              <ul className="list-disc pr-8 space-y-2">
                <li>מספר המשתמשים הפעילים</li>
                <li>ממוצע עסקאות</li>
                <li>אחוז שימוש בתכונות שונות</li>
              </ul>
              <div className="bg-accent/10 border-r-4 border-accent p-5 rounded-lg">
                <p><strong>הנתונים הללו לא כוללים מידע מזהה אישית</strong> (לא שם, לא כתובת מייל, לא תוכן יומן אישי).</p>
              </div>
              <p>
                הנתונים משמשים אך ורק לשיפור חוויית המשתמש ולבקרת איכות פנימית.
              </p>
            </div>
          </section>

          {/* מדיניות פרטיות */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              📜 התחייבות המערכת
            </h2>
            <div className="space-y-3 text-base md:text-lg leading-relaxed">
              <ul className="list-disc pr-8 space-y-2">
                <li>
                  <strong>סודיות מלאה:</strong> המערכת מתחייבת לשמור על סודיות המידע של המשתמשים.
                </li>
                <li>
                  <strong>ללא העברה לצד שלישי:</strong> לא תועבר כל אינפורמציה לצד שלישי ללא הסכמת המשתמש.
                </li>
                <li>
                  <strong>זכות למחיקה:</strong> המשתמשים יכולים לבקש מחיקה מלאה של הנתונים שלהם בכל עת.
                </li>
                <li>
                  <strong>הצפנה ואבטחה:</strong> כל הנתונים מוצפנים ומוגנים בהתאם לתקני אבטחה מתקדמים.
                </li>
                <li>
                  <strong>הסכמה:</strong> שימוש באפליקציה מהווה הסכמה למדיניות זו.
                </li>
              </ul>
            </div>
          </section>

          {/* אבטחה טכנית */}
          <section>
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              ⚙️ אבטחה טכנית
            </h2>
            <div className="space-y-3 text-base md:text-lg leading-relaxed">
              <ul className="list-disc pr-8 space-y-2">
                <li>
                  <strong>הצפנת נתונים:</strong> כל הנתונים מוצפנים ומאובטחים
                </li>
                <li>
                  <strong>אימות משתמשים:</strong> מערכת אימות מאובטחת עם הצפנת סיסמאות
                </li>
                <li>
                  <strong>הגנה ברמת המשתמש:</strong> הגבלת גישה קפדנית - כל משתמש רואה רק את המידע שלו
                </li>
                <li>
                  <strong>ללא אחסון מקומי רגיש:</strong> מידע רגיש לא נשמר בדפדפן
                </li>
              </ul>
            </div>
          </section>

          {/* יצירת קשר */}
          <section className="bg-secondary/20 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              📧 יצירת קשר
            </h2>
            <p className="text-base md:text-lg leading-relaxed">
              לשאלות, בקשות למחיקת מידע או כל פנייה אחרת בנושא הפרטיות, אנא פנה אלינו דרך דף יצירת הקשר באפליקציה.
            </p>
          </section>

          {/* תאריך עדכון אחרון */}
          <div className="text-center text-sm text-muted-foreground pt-6 border-t border-border">
            <p>מדיניות פרטיות זו עודכנה לאחרונה ב-{new Date().toLocaleDateString('he-IL')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}