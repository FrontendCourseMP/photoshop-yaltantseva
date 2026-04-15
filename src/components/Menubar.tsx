import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "./ui/menubar"

export function MenubarDemo() {
  return (
    <Menubar className="">
      <MenubarMenu>
        <MenubarTrigger>Файл</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem>
              Создать... <MenubarShortcut>⌘C</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Открыть... <MenubarShortcut>⌘O</MenubarShortcut>
            </MenubarItem>
            <MenubarSub>
              <MenubarSubTrigger>Сохранить как...</MenubarSubTrigger>
              <MenubarSubContent>
                <MenubarGroup>
                  <MenubarItem>PNG</MenubarItem>
                  <MenubarItem>JPG</MenubarItem>
                  <MenubarItem>GB7</MenubarItem>
                </MenubarGroup>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Правка</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem>
              Отменить <MenubarShortcut>⌘ctrl+Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Вернуть <MenubarShortcut>⌘ctrl+Y</MenubarShortcut>
            </MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem>Вырезать</MenubarItem>
            <MenubarItem>Копировать</MenubarItem>
            <MenubarItem>Вставить</MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Вид</MenubarTrigger>
        <MenubarContent className="w-44">
          <MenubarGroup>
            <MenubarCheckboxItem>Bookmarks Bar</MenubarCheckboxItem>
            <MenubarCheckboxItem checked>Full URLs</MenubarCheckboxItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem inset>
              Reload <MenubarShortcut>⌘R</MenubarShortcut>
            </MenubarItem>
            <MenubarItem disabled inset>
              Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
            </MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem inset>Toggle Fullscreen</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem inset>Hide Sidebar</MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Фильтры</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="benoit">
            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem inset>Edit...</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem inset>Add Profile...</MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
