import tkinter as tk
from tkinter import filedialog
import customtkinter as ctk
import os

class FileListApp:
    def __init__(self):
        self.window = ctk.CTk()
        self.window.title("File Name Generator")
        self.window.geometry("600x400")

        # Create main frame
        self.main_frame = ctk.CTkFrame(self.window)
        self.main_frame.pack(pady=20, padx=20, fill="both", expand=True)

        # Folder selection button
        self.select_btn = ctk.CTkButton(
            self.main_frame,
            text="Select Folder",
            command=self.select_folder
        )
        self.select_btn.pack(pady=10)

        # Text area for displaying files
        self.file_display = ctk.CTkTextbox(
            self.main_frame,
            width=500,
            height=300
        )
        self.file_display.pack(pady=10)

        # Copy button
        self.copy_btn = ctk.CTkButton(
            self.main_frame,
            text="Copy to Clipboard",
            command=self.copy_to_clipboard
        )
        self.copy_btn.pack(pady=10)

    def select_folder(self):
        folder_path = filedialog.askdirectory()
        if folder_path:
            file_list = []
            for file in os.listdir(folder_path):
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    file_list.append(f"'{file}',")
            
            # Clear previous content
            self.file_display.delete("1.0", tk.END)
            
            # Format similar to example
            self.file_display.insert("1.0", "const imageNames = [\n")
            for file in file_list:
                self.file_display.insert(tk.END, f"    {file}\n")
            self.file_display.insert(tk.END, "];")

    def copy_to_clipboard(self):
        self.window.clipboard_clear()
        self.window.clipboard_append(self.file_display.get("1.0", tk.END))

    def run(self):
        self.window.mainloop()

if __name__ == "__main__":
    app = FileListApp()
    app.run()
