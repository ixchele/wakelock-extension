UUID = wakelock@ixchele.github.io
CLEAN_UUID = $(strip $(UUID))
ZIP_FILE = $(CLEAN_UUID).shell-extension.zip

.PHONY: all pack install enable disable clean reload

all: pack install reload enable

pack: clean
	@echo "Packing extension..."
	gnome-extensions pack --force

install: pack
	@echo "Installing extension..."
	gnome-extensions install --force $(ZIP_FILE)

enable:
	@echo "Enabling extension..."
	gnome-extensions enable $(CLEAN_UUID)

disable:
	@echo "Disabling extension..."
	gnome-extensions disable $(CLEAN_UUID)

clean:
	@echo "Cleaning generated files..."
	rm -f $(ZIP_FILE)

reload:
	@echo "Restarting GNOME Shell (X11 only)..."
	killall -SIGQUIT gnome-shell
	sleep 2
