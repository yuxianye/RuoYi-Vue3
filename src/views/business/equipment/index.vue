<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="设备编码" prop="equipCode">
        <el-input
          v-model="queryParams.equipCode"
          placeholder="请输入设备编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备名称" prop="equipName">
        <el-input
          v-model="queryParams.equipName"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备品牌" prop="equipBrand">
        <el-input
          v-model="queryParams.equipBrand"
          placeholder="请输入设备品牌"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="设备分类" prop="equipClassif">
        <el-select v-model="queryParams.equipClassif" placeholder="请选择设备分类" clearable>
          <el-option
            v-for="dict in equip_classif"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备状态" prop="equipStatus">
        <el-select v-model="queryParams.equipStatus" placeholder="请选择设备状态" clearable>
          <el-option
            v-for="dict in equip_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['business:equipment:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:equipment:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:equipment:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:equipment:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="equipmentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="设备主键" align="center" prop="equipId" />
      <el-table-column label="设备编码" align="center" prop="equipCode" />
      <el-table-column label="设备名称" align="center" prop="equipName" />
      <el-table-column label="设备品牌" align="center" prop="equipBrand" />
      <el-table-column label="设备分类" align="center" prop="equipClassif">
        <template #default="scope">
          <dict-tag :options="equip_classif" :value="scope.row.equipClassif"/>
        </template>
      </el-table-column>
      <el-table-column label="设备状态" align="center" prop="equipStatus">
        <template #default="scope">
          <dict-tag :options="equip_status" :value="scope.row.equipStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:equipment:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:equipment:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改设备对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="equipmentRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="设备编码" prop="equipCode">
          <el-input v-model="form.equipCode" placeholder="请输入设备编码" />
        </el-form-item>
        <el-form-item label="设备名称" prop="equipName">
          <el-input v-model="form.equipName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备品牌" prop="equipBrand">
          <el-input v-model="form.equipBrand" placeholder="请输入设备品牌" />
        </el-form-item>
        <el-form-item label="设备分类" prop="equipClassif">
          <el-select v-model="form.equipClassif" placeholder="请选择设备分类">
            <el-option
              v-for="dict in equip_classif"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备状态" prop="equipStatus">
          <el-select v-model="form.equipStatus" placeholder="请选择设备状态">
            <el-option
              v-for="dict in equip_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Equipment">
import { listEquipment, getEquipment, delEquipment, addEquipment, updateEquipment } from "@/api/business/equipment";

const { proxy } = getCurrentInstance();
const { equip_classif, equip_status } = proxy.useDict('equip_classif', 'equip_status');

const equipmentList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    equipCode: null,
    equipName: null,
    equipBrand: null,
    equipClassif: null,
    equipStatus: null,
  },
  rules: {
    equipCode: [
      { required: true, message: "设备编码不能为空", trigger: "blur" }
    ],
    equipName: [
      { required: true, message: "设备名称不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询设备列表 */
function getList() {
  loading.value = true;
  listEquipment(queryParams.value).then(response => {
    equipmentList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    equipId: null,
    equipCode: null,
    equipName: null,
    equipBrand: null,
    equipClassif: null,
    equipStatus: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  };
  proxy.resetForm("equipmentRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.equipId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加设备";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _equipId = row.equipId || ids.value
  getEquipment(_equipId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改设备";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["equipmentRef"].validate(valid => {
    if (valid) {
      if (form.value.equipId != null) {
        updateEquipment(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEquipment(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _equipIds = row.equipId || ids.value;
  proxy.$modal.confirm('是否确认删除设备编号为"' + _equipIds + '"的数据项？').then(function() {
    return delEquipment(_equipIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/equipment/export', {
    ...queryParams.value
  }, `equipment_${new Date().getTime()}.xlsx`)
}

getList();
</script>
