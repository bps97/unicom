<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>物料管理</el-breadcrumb-item>
      <el-breadcrumb-item>物料信息</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <!-- tab 页签区域 -->
    <el-tabs v-model="activeName"
             @tab-click="shiftTabs"
             type="border-card">
      <el-tab-pane v-for='item in warehouseNames'
                   :key='item.key'
                   :label='item.value'
                   :name='item.key' />
      <el-row :gutter="20">
        <!-- 选择商品分类区域 -->
        <el-col :span='5'>
          <el-cascader expand-trigger="hover"
                       :options="parentCategoryList"
                       :props="cascaderProps"
                       v-model="selectedKeys"
                       @change="parentCategoryChanged" />
        </el-col>
        <el-col :span="6">
          <el-input placeholder="请输入关键字"
                    v-model="queryInfo.key"
                    clearable
                    @clear="listMaterials">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="listMaterials" />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-popover placement="right"
                      title="点击添加『物料』"
                      trigger="hover"
                      content="注意此处添加物料并不会修改仓库内物料数量">
            <el-button type="primary"
                       slot="reference"
                       @click="showAddMaterialDialog">添加物料</el-button>
          </el-popover>
        </el-col>
      </el-row>
      <br>
      <!-- table表格区域 -->
      <el-table :data="materialList"
                border
                stripe
                height="484">
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-form label-position="left"
                     inline
                     class="demo-table-expand">
              <el-form-item label="物料ID">
                <span>{{ props.row.id }}</span>
              </el-form-item>
              <el-form-item label="专业线">
                <span>{{ props.row.specialLine }}</span>
              </el-form-item>

              <el-form-item label="分类名">
                <span>{{ props.row.categoryName }}</span>
              </el-form-item>

              <el-form-item label="所在仓库">
                <span>{{ props.row.warehouseName }}</span>
              </el-form-item>

              <el-form-item label="更新时间">
                <span>{{ props.row.updateTime }}</span>
              </el-form-item>

            </el-form>
          </template>
        </el-table-column>
        <!-- <el-table-column type="index" /> -->
        <el-table-column label="物料名称"
                         prop="name" />
        <el-table-column label="损坏状态"
                         prop="status"
                         width="50px" />
        <el-table-column label="物料数量"
                         align="center"
                         prop="count"
                         width="80px" />
        <el-table-column label="操作"
                         width="175px">
          <template slot-scope="scope">

            <el-button type="primary"
                       icon="el-icon-edit"
                       size="mini"
                       @click="showEditDialog(scope.row.id)" />
            <el-button type="danger"
                       icon="el-icon-delete"
                       size="mini"
                       @click="removeById(scope.row.id)" />

            <el-button type="success"
                       icon="el-icon-view"
                       size="mini"
                       @click="showRecordDialog(scope.row.id)" />

          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 8, 10, 15]"
                     :page-size="queryInfo.size"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total"
                     background />

      <!-- 修改分类的对话框 -->
      <el-dialog title="修改物料"
                 :visible.sync="editDialogVisible"
                 width="50%"
                 @close="editDialogClosed">
        <el-form :model="editForm"
                 ref="editFormRef"
                 label-width="70px">
          <el-form-item label="名称">
            <el-input v-model="editForm.name" />
          </el-form-item>
          <el-form-item label="专业线"
                        prop="specialLine">
            <el-input v-model="editForm.specialLine"
                      disabled />
          </el-form-item>
          <el-form-item label="分类"
                        prop="categoryName">
            <el-input v-model="editForm.categoryName"
                      disabled />
          </el-form-item>
          <el-form-item label="仓库"
                        prop="warehouseName">
            <el-input v-model="editForm.warehouseName"
                      disabled />
          </el-form-item>
          <el-form-item label="数量"
                        prop="count">
            <el-input v-model="editForm.count"
                      disabled />
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editCategoryInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 添加物料的对话框 -->
      <el-dialog title="添加物料"
                 :visible.sync="addMaterialDialogVisible"
                 width="50%"
                 @close="addMaterialDialogClosed">
        <!-- 添加分类的表单 -->

        <el-form :model="addMaterialForm"
                 ref="addMaterialFormRef"
                 label-width="100px">
          <el-form-item label="父级分类：">
            <!-- options 用来指定数据源 -->
            <!-- props 用来指定配置对象 -->
            <el-cascader expand-trigger="hover"
                         :options="parentCategoryList_add"
                         :props="cascaderProps_add"
                         v-model="selectedKeys_add"
                         @change="parentCategoryChanged_add" />
          </el-form-item>
          <el-form-item label="仓库位置："
                        prop="warehouseId">
            <el-select v-model="addMaterialForm.warehouseId"
                       placeholder="请选择仓库">
              <el-option v-for="item in warehouseNames"
                         :key='item.key'
                         :label='item.value'
                         :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="物料名称：">
            <el-input prop="name"
                      v-model="addMaterialForm.name" />
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addMaterialDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addMaterial">确 定</el-button>
        </span>
      </el-dialog>

      <el-dialog title="日志信息"
                 :visible.sync="recordDialogVisible">
        <div class="block">
          <el-timeline>
            <el-timeline-item timestamp="2018/4/12"
                              placement="top">
              <el-card>
                <h4>更新 Github 模板</h4>
                <p>王小虎 提交于 2018/4/12 20:46</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2018/4/3"
                              placement="top">
              <el-card>
                <h4>更新 Github 模板</h4>
                <p>王小虎 提交于 2018/4/3 20:46</p>
              </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2018/4/2"
                              placement="top">
              <el-card>
                <h4>更新 Github 模板</h4>
                <p>王小虎 提交于 2018/4/2 20:46</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-dialog>
    </el-tabs>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        key: '',
        page: 1,
        size: 8,
        categoryId: ''
      },
      // 仓库列表
      warehouseNames: [],
      activeName: '1270283833125527553',
      // 商品列表
      materialList: undefined,
      // 总数据条数
      total: 0,
      // 父级分类的列表
      parentCategoryList: [],
      parentCategoryList_add: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true
      },
      cascaderProps_add: {
        value: 'id',
        label: 'name',
        children: 'children'
        // checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      selectedKeys_add: [],
      // 控制添加w物料对话框的显示与隐藏
      addMaterialDialogVisible: false,
      addMaterialForm: {
        name: '',
        warehouseId: '',
        categoryId: ''
      },
      editDialogVisible: false,
      recordDialogVisible: false,
      // 查询到的分类信息对象
      editForm: {}
    }
  },
  created () {
    // 先获取父级分类的数据列表
    this.getParentcateList()
    this.listWarehouseNames()
  },
  methods: {
    async listWarehouseNames () {
      const { data: res } = await this.$http.get('warehouse/names')

      if (res.meta.status !== 200) {
        return this.$message.error('获取仓库列表失败！')
      }
      this.warehouseNames = res.data
    },

    // 点击按钮，展示添加物料的对话框
    showAddMaterialDialog () {
      this.addMaterialDialogVisible = true
      this.parentCategoryList_add = this.parentCategoryList
      this.listWarehouseNames()
    },
    // 监听添加物料对话框的关闭事件
    addMaterialDialogClosed () {
      this.$refs.addMaterialFormRef.resetFields()
    },

    handleSizeChange (newSize) {
      this.queryInfo.size = newSize
      this.listMaterials()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.page = newPage
      this.listMaterials()
    },

    // 选择项发生变化触发这个函数
    parentCategoryChanged () {
      if (this.selectedKeys !== undefined) {
        if (this.selectedKeys.length > 0) {
          this.queryInfo.categoryId = this.selectedKeys[
            this.selectedKeys.length - 1
          ]
        }
      }
    },
    parentCategoryChanged_add () {
      if (this.selectedKeys_add !== undefined) {
        this.addMaterialForm.categoryId = this.selectedKeys_add[
          this.selectedKeys_add.length - 1
        ]
      }
    },

    // 后端数据接口👇

    // 删除指定物料
    async removeById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除！')
      }
      const { data: res } = await this.$http.delete(`material/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }

      this.$message.success('删除成功！')
      this.listMaterials()
    },
    // 展示编辑用户的弹框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('material/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('获取物料信息失败！')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    }, // 展示日志信息的弹框
    async showRecordDialog (id) {
      // console.log(id)
      // const { data: res } = await this.$http.get('material/' + id)

      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物料信息失败！')
      // }

      // this.editForm = res.data
      this.recordDialogVisible = true
    },
    // 点击按钮，添加新的物料
    addMaterial () {
      this.$refs.addMaterialFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'material/add',
          this.addMaterialForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('新增物料失败！')
        }
        this.$message.success('新增物料成功！')
        this.addMaterialDialogVisible = false
        this.listMaterials()
      })
    },

    // 请求获取分类菜单
    async getParentcateList () {
      const { data: res } = await this.$http.get('category/menus', {})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      this.parentCategoryList = res.data
      return res.data
    },

    // 根据分页信息请求对应的物料列表
    async listMaterials () {
      const { data: res } = await this.$http.get('material', {
        params: {
          current: this.queryInfo.page,
          size: this.queryInfo.size,
          categoryId: this.queryInfo.categoryId,
          key: this.queryInfo.key,
          warehouseId: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        this.materialList = undefined
        return this.$message.error(res.meta.message)
      }
      this.$message.success('获取商品列表成功！')
      this.materialList = res.data.records
      console.log(this.materialList)
      this.total = res.data.total
    },

    // 修改物料信息并提交
    editCategoryInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'material/' + this.editForm.id,
          {
            name: this.editForm.name
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error('更新物料信息失败！')
        }
        // 提示修改成功
        this.$message.success('更新物料信息成功！')
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据列表
        this.listMaterials()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
