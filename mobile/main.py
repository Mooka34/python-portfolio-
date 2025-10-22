from kivymd.app import MDApp
from kivymd.uix.screen import MDScreen
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.textfield import MDTextField
from kivymd.uix.button import MDRaisedButton
from kivymd.uix.label import MDLabel
from kivy.core.window import Window
from kivy.lang import Builder
from kivy.properties import StringProperty
from detector.engine import detect_fake_job


class ResultLabel(MDLabel):
    pass


class DetectScreen(MDScreen):
    title = StringProperty("")
    company = StringProperty("")
    description = StringProperty("")
    salary = StringProperty("")
    location = StringProperty("")
    link = StringProperty("")

    def on_detect(self):
        result = detect_fake_job(
            title=self.ids.title.text,
            company=self.ids.company.text,
            description=self.ids.description.text,
            salary=self.ids.salary.text or None,
            location=self.ids.location.text or None,
            link=self.ids.link.text or None,
        )
        label = result["label"].upper()
        conf = int(result["confidence"] * 100)
        self.ids.result.text = f"Prediction: {label}  •  Confidence: {conf}%"
        self.ids.scores.text = (
            f"Fake: {result['scores']['fake']:.2f}  |  Real: {result['scores']['real']:.2f}"
        )


class FakeJobApp(MDApp):
    def build(self):
        self.title = "Fake Job Detector"
        self.icon = "assets/icon.png"
        Window.minimum_width, Window.minimum_height = 360, 640
        # Prefer light theme with primary color close to web app
        self.theme_cls.primary_palette = "LightBlue"
        self.theme_cls.theme_style = "Light"
        Builder.load_file("ui.kv")
        return DetectScreen()


if __name__ == "__main__":
    FakeJobApp().run()
