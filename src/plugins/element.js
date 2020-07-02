import Vue from 'vue'
import {
  Button, Form, FormItem, Input, Message, Container, Header, Aside, Main, Menu,
  Submenu, MenuItem, Breadcrumb, BreadcrumbItem, Card, Row, Col, Table, TableColumn,
  Switch, Tooltip, Pagination, Dialog, MessageBox, Tag, Cascader, Alert, Tabs, TabPane,
  Steps, Step, CheckboxGroup, CheckboxButton, Upload, Select, Option, Timeline, TimelineItem,
  Autocomplete, Slider
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(CheckboxGroup)
Vue.use(CheckboxButton)
Vue.use(Upload)
Vue.use(Select)
Vue.use(Option)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.use(Autocomplete)
Vue.use(Slider)
Vue.prototype.$message = Message // 全局挂载
Vue.prototype.$confirm = MessageBox.confirm
