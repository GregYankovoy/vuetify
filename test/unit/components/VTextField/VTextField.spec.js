import { test } from '@/test'
import Vue from 'vue/dist/vue.common'
import VTextField from '@/components/VTextField/VTextField'
import VProgressLinear from '@/components/VProgressLinear'

test('VTextField.js', ({ mount }) => {
  it('should render component and match snapshot', () => {
    const wrapper = mount(VTextField)

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should pass required attr to the input', () => {
    const wrapper = mount(VTextField, {
      attrs: {
        required: true
      }
    })

    const input = wrapper.find('input')[0]
    expect(input.getAttribute('required')).toBe('required')
  })

  it('should pass events to internal input field', () => {
    const keyup = jest.fn()
    const component = {
      render (h) {
        return h(VTextField, { on: { keyUp: keyup }, props: { download: '' }, attrs: {} })
      }
    }
    const wrapper = mount(component)

    const input = wrapper.find('input')[0]
    input.trigger('keyUp', { keyCode: 65 })

    expect(keyup).toBeCalled()
  })

  it('should render aria-label attribute on text field element with label value and no id', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        label: 'Test'
      },
      attrs: {}
    })

    const inputGroup = wrapper.find('input')[0]
    expect(inputGroup.getAttribute('aria-label')).toBe('Test')
  })

  it('should not render aria-label attribute on text field element with no label value or id', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        label: null
      },
      attrs: {}
    })

    const inputGroup = wrapper.find('input')[0]
    expect(inputGroup.element.getAttribute('aria-label')).toBeFalsy()
  })

  it('should not render aria-label attribute on text field element with id', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        label: 'Test'
      },
      attrs: {
        id: 'Test'
      }
    })

    const inputGroup = wrapper.find('input')[0]
    expect(inputGroup.element.getAttribute('aria-label')).toBeFalsy()
  })

  it('should start out as invalid', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        rules: [(v) => !!v || 'Required']
      }
    })

    expect(wrapper.data().valid).toEqual(false)
  })

  it('should start validating on input', async () => {
    const wrapper = mount(VTextField)

    expect(wrapper.vm.shouldValidate).toEqual(false)
    wrapper.setProps({ value: 'asd' })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.shouldValidate).toEqual(true)
  })

  it('should not start validating on input if validate-on-blur prop is set', async () => {
    const wrapper = mount(VTextField, {
      propsData: {
        validateOnBlur: true
      }
    })

    expect(wrapper.vm.shouldValidate).toEqual(false)
    wrapper.setProps({ value: 'asd' })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.shouldValidate).toEqual(false)
  })

  it('should not display counter when set to false/undefined/null', async () => {
    const wrapper = mount(VTextField, {
      propsData: {
        counter: true
      },
      attrs: {
        maxlength: 50
      }
    })

    expect(wrapper.find('.v-counter')[0]).not.toBe(undefined)
    expect(wrapper.html()).toMatchSnapshot()

    wrapper.setProps({ counter: false })
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.find('.v-counter')[0]).toBe(undefined)

    wrapper.setProps({ counter: undefined })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.v-counter')[0]).toBe(undefined)

    wrapper.setProps({ counter: null })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.v-counter')[0]).toBe(undefined)
  })

  it('should have readonly attribute', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        readonly: true
      }
    })

    const input = wrapper.find('input')[0]

    expect(input.getAttribute('readonly')).toBe('readonly')
  })

  it('should clear input value', async () => {
    const wrapper = mount(VTextField, {
      propsData: {
        clearable: true,
        value: 'foo'
      }
    })

    const clear = wrapper.find('.v-input__icon--clear .v-icon')[0]
    const input = jest.fn()
    wrapper.vm.$on('input', input)

    expect(wrapper.vm.internalValue).toBe('foo')

    clear.trigger('click')

    await wrapper.vm.$nextTick()

    expect(input).toHaveBeenCalledWith(null)
  })

  it('should not clear input if not clearable and has appended icon (with callback)', async () => {
    const appendIconCb = jest.fn()
    const wrapper = mount(VTextField, {
      propsData: {
        value: 'foo',
        appendIcon: 'block',
      },
      listeners: {
        'click:append': appendIconCb
      }
    })

    const icon = wrapper.find('.v-input__icon--append .v-icon')[0]
    icon.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.internalValue).toBe('foo')
    expect(appendIconCb.mock.calls).toHaveLength(1)
  })

  it('should not clear input if not clearable and has appended icon (without callback)', async () => {
    const wrapper = mount(VTextField, {
      propsData: {
        value: 'foo',
        appendIcon: 'block',
      }
    })

    const icon = wrapper.find('.v-input__icon--append .v-icon')[0]
    icon.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.internalValue).toBe('foo')
  })

  it('should start validating on blur', async () => {
    const rule = jest.fn().mockReturnValue(true)
    const wrapper = mount(VTextField, {
      propsData: {
        rules: [rule],
        validateOnBlur: true
      }
    })

    const input = wrapper.first('input')
    expect(wrapper.vm.shouldValidate).toEqual(false)

    // Rules are called once on mount
    expect(rule).toHaveBeenCalledTimes(1)

    input.trigger('focus')
    await wrapper.vm.$nextTick()

    input.element.value = 'f'
    input.trigger('input')
    await wrapper.vm.$nextTick()
    expect(rule).toHaveBeenCalledTimes(1)

    input.trigger('blur')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.shouldValidate).toEqual(true)
    expect(rule).toHaveBeenCalledTimes(2)
  })

  it('should keep its value on blur', async () => {
    const wrapper = mount(VTextField, {
      propsData: {
        value: 'asd'
      }
    })

    const input = wrapper.find('input')[0]

    input.element.value = 'fgh'
    input.trigger('input')
    input.trigger('blur')

    expect(input.element.value).toBe('fgh')
  })

  it('should update if value is changed externally', async () => {
    const wrapper = mount(VTextField, {})

    const input = wrapper.find('input')[0]

    wrapper.setProps({ value: 'fgh' })
    expect(input.element.value).toBe('fgh')

    input.trigger('focus')
    wrapper.setProps({ value: 'jkl' })
    expect(input.element.value).toBe('jkl')
  })

  it('should fire a single change event on blur', async () => {
    let value = 'asd'
    const change = jest.fn()

    const component = {
      render (h) {
        return h(VTextField, {
          on: {
            input: (i) => value = i,
            change
          },
          props: { value }
        })
      }
    }
    const wrapper = mount(component)

    const input = wrapper.find('input')[0]

    input.trigger('focus')
    await wrapper.vm.$nextTick()
    input.element.value = 'fgh'
    input.trigger('input')

    await wrapper.vm.$nextTick()
    input.trigger('blur')
    await wrapper.vm.$nextTick()

    expect(change).toBeCalledWith('fgh')
    expect(change.mock.calls).toHaveLength(1)
  })

  it('should not make prepend icon clearable', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        prependIcon: 'check',
        appendIcon: 'check',
        value: 'test',
        clearable: true
      }
    })

    const prepend = wrapper.find('.v-input__icon--append .v-icon')[0]
    expect(prepend.text()).toBe('check')
    expect(prepend.element.classList).not.toContain('input-group__icon-cb')
  })

  it('should not emit change event if value has not changed', async () => {
    const change = jest.fn()
    let value = 'test'
    const component = {
      render (h) {
        return h(VTextField, {
          on: {
            input: i => value = i,
            change
          },
          props: { value }
        })
      }
    }
    const wrapper = mount(component)

    const input = wrapper.find('input')[0]

    input.trigger('focus')
    await wrapper.vm.$nextTick()
    input.trigger('blur')
    await wrapper.vm.$nextTick()

    expect(change.mock.calls).toHaveLength(0)
  })

  it('should render component with async loading and match snapshot', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        loading: true
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render component with async loading and custom progress and match snapshot', () => {
    const progress = Vue.component('test', {
      render (h) {
        return h(VProgressLinear, {
          props: {
            indeterminate: true,
            height: 7,
            color: 'orange'
          }
        })
      }
    })

    const wrapper = mount(VTextField, {
      propsData: {
        loading: true
      },
      slots: {
        progress: [progress]
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should display the number 0', async () => {
    const wrapper = mount(VTextField, {
      propsData: { value: 0 }
    })

    expect(wrapper.vm.$refs.input.value).toBe('0')
  })

  it('should reset internal change on blur and keydown', async () => {
    const wrapper = mount(VTextField)

    wrapper.setProps({ value: 'foo' })
    wrapper.vm.internalChange = true
    expect(wrapper.vm.internalChange).toBe(true)
    wrapper.vm.onBlur()
    expect(wrapper.vm.internalChange).toBe(false)

    wrapper.first('input').trigger('keydown')

    expect(wrapper.vm.internalChange).toBe(true)
  })

  it('should emit input when externally set value was modified internally', async () => {
    let value = '33'
    const input = jest.fn()
    const wrapper = mount(VTextField, {
      propsData: {
        value,
        mask: '##',
        returnMaskedValue: true
      }
    })

    wrapper.vm.$on('input', (v) => {
      value = v
    })
    wrapper.vm.$on('input', input)

    wrapper.setProps({ value: '4444' })
    await wrapper.vm.$nextTick()

    expect(value).toBe('44')
    expect(input).toBeCalled()
  })

  it('should mask value if return-masked-value is true', async () => {
    let value = '44'
    const component = {
      render (h) {
        return h(VTextField, {
          on: {
            input: i => value = i
          },
          props: {
            value,
            returnMaskedValue: true,
            mask: '#-#',
          }
        })
      }
    }

    const wrapper = mount(component)
    const input = wrapper.find('input')[0]

    expect(value).toBe('4-4')

    input.trigger('focus')
    await wrapper.vm.$nextTick()
    input.element.value = '33'
    input.trigger('input')
    await wrapper.vm.$nextTick()

    expect(value).toBe('3-3')
  })

  it('should not mask value if return-masked-value is false', async () => {
    let value = '44'
    const component = {
      render (h) {
        return h(VTextField, {
          on: {
            input: i => value = i
          },
          props: {
            value,
            returnMaskedValue: false,
            mask: '#-#',
          }
        })
      }
    }

    const wrapper = mount(component)
    const input = wrapper.find('input')[0]

    expect(value).toBe('44')

    input.trigger('focus')
    await wrapper.vm.$nextTick()
    input.element.value = '33'
    input.trigger('input')
    await wrapper.vm.$nextTick()

    expect(value).toBe('33')
  })

  it('should use pre-defined mask if prop matches', async () => {
    let value = '12311999'
    const component = {
      render (h) {
        return h(VTextField, {
          on: {
            input: i => value = i
          },
          props: {
            value,
            returnMaskedValue: true,
            mask: 'date',
          }
        })
      }
    }

    const wrapper = mount(component)

    expect(value).toBe('12/31/1999')
  })

  it('should allow switching mask', async () => {
    const wrapper = mount(VTextField, {
      propsData: {
        mask: '#-#-#',
        value: '1-2-3'
      }
    })

    const input = wrapper.find('input')[0]

    expect(input.element.value).toBe('1-2-3')

    wrapper.setProps({ mask: '#.#.#'})
    await wrapper.vm.$nextTick()

    expect(input.element.value).toBe('1.2.3')

    wrapper.setProps({ mask: '#,#' })
    await wrapper.vm.$nextTick()

    expect(input.element.value).toBe('1,2')
  })

  it('should autofocus', async () => {
    const wrapper = mount(VTextField, {
      attachToDocument: true,
      propsData: {
        autofocus: true
      }
    })

    const focus = jest.fn()
    wrapper.vm.$on('focus', focus)

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.isFocused).toBe(true)
    wrapper.vm.onClick()

    expect(focus.mock.calls.length).toBe(0)

    wrapper.setData({ isFocused: false })

    wrapper.vm.onClick()
    expect(focus.mock.calls.length).toBe(1)

    wrapper.setProps({ disabled: true })

    wrapper.setData({ isFocused: false })

    wrapper.vm.onClick()
    expect(focus.mock.calls.length).toBe(1)

    wrapper.setProps({ disabled: false })

    wrapper.vm.onClick()
    expect(focus.mock.calls.length).toBe(2)

    delete wrapper.vm.$refs.input

    wrapper.vm.onFocus()
    expect(focus.mock.calls.length).toBe(2)
  })

  it('should have prefix and suffix', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        prefix: '$',
        suffix: '.com'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should use a custom clear callback', async () => {
    const clearIconCb = jest.fn()
    const wrapper = mount(VTextField, {
      propsData: {
        clearable: true,
        value: 'foo'
      },
      listeners: {
        'click:clear': clearIconCb
      }
    })

    wrapper.first('.v-input__icon--clear .v-icon').trigger('click')

    expect(clearIconCb).toBeCalled()
  })

  it('should not generate label', () => {
    const wrapper = mount(VTextField)

    expect(wrapper.vm.genLabel()).toBe(null)

    wrapper.setProps({ singleLine: true })

    expect(wrapper.vm.genLabel()).toBe(null)

    wrapper.setProps({ placeholder: 'foo' })

    expect(wrapper.vm.genLabel()).toBe(null)

    wrapper.setProps({
      placeholder: undefined,
      value: 'bar'
    })

    expect(wrapper.vm.genLabel()).toBe(null)

    wrapper.setProps({
      label: 'bar',
      value: undefined
    })

    expect(wrapper.vm.genLabel()).toBeTruthy()
  })

  it('should propagate id to label for attribute', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        label: 'foo',
        id: 'bar'
      },
      attrs: {
        id: 'bar'
      },
      domProps: {
        id: 'bar'
      }
    })

    const label = wrapper.first('label')

    expect(label.element.getAttribute('for')).toBe('bar')
  })

  it('should render an appended outer icon', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        appendOuterIcon: 'search'
      }
    })

    expect(wrapper.first('.v-input__icon--append-outer .v-icon').element.innerHTML).toBe('search')
  })

  // TODO: revisit this, it seems correct in practice because of onBlur()
  it.skip('should reset internal change', async () => {
    const wrapper = mount(VTextField)

    wrapper.setData({ internalChange: true })

    expect(wrapper.vm.internalChange).toBe(true)

    wrapper.setProps({ value: 'foo' })

    expect(wrapper.vm.internalChange).toBe(false)
  })

  it('should have correct max value', async () => {
    const wrapper = mount(VTextField, {
      attrs: {
        maxlength: 25
      },
      propsData: {
        counter: true
      }
    })

    const counter = wrapper.first('.v-counter')

    expect(counter.element.innerHTML).toBe('0 / 25')

    wrapper.setProps({ counter: '50' })

    expect(counter.element.innerHTML).toBe('0 / 50')
  })

  it('should set bad input on input', () => {
    const wrapper = mount(VTextField)

    expect(wrapper.vm.badInput).toBeFalsy()

    wrapper.vm.onInput({
      target: {}
    })

    expect(wrapper.vm.badInput).toBeFalsy()

    wrapper.vm.onInput({
      target: { validity: { badInput: false } }
    })

    expect(wrapper.vm.badInput).toBeFalsy()

    wrapper.vm.onInput({
      target: { validity: { badInput: true } }
    })

    expect(wrapper.vm.badInput).toBe(true)
  })

  it('should set input autocomplete attr', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        browserAutocomplete: 'off'
      }
    })

    const input = wrapper.first('input')

    expect(input.element.autocomplete).toBe('off')
  })

  it('should not apply id to root element', () => {
    const wrapper = mount(VTextField, {
      attrs: { id: 'foo' }
    })

    const input = wrapper.first('input')
    expect(wrapper.element.id).toBe('')
    expect(input.element.id).toBe('foo')
  })

  it('should fire change event when pressing enter', () => {
    const wrapper = mount(VTextField)
    const input = wrapper.first('input')
    const change = jest.fn()

    wrapper.vm.$on('change', change)

    input.trigger('focus')
    input.element.value = 'foo'
    input.trigger('input')
    input.trigger('keydown.enter')
    input.trigger('keydown.enter')

    expect(change).toHaveBeenCalledTimes(2)
  })

  it('should have focus and blur methods', () => {
    const wrapper = mount(VTextField)
    const focus = jest.fn()
    const blur = jest.fn()
    wrapper.vm.$on('focus', focus)
    wrapper.vm.$on('blur', blur)

    wrapper.vm.focus()
    expect(focus).toHaveBeenCalledTimes(1)

    wrapper.vm.blur()
    expect(blur).toHaveBeenCalledTimes(1)
  })

  it('should activate label when using dirtyTypes', async () => {
    const dirtyTypes = ['color', 'file', 'time', 'date', 'datetime-local', 'week', 'month']
    const wrapper = mount(VTextField, {
      propsData: {
        label: 'Foobar'
      }
    })
    const label = wrapper.first('.v-label')


    for (const type of dirtyTypes) {
      wrapper.setProps({ type })

      await wrapper.vm.$nextTick()

      expect(label.element.classList).toContain('v-label--active')
      expect(wrapper.vm.$el.classList).toContain('v-input--is-label-active')

      wrapper.setProps({ type: undefined })

      await wrapper.vm.$nextTick()

      expect(label.element.classList).not.toContain('v-label--active')
      expect(wrapper.vm.$el.classList).not.toContain('v-input--is-label-active')
    }
  })

  it('should apply theme to label, counter, messages and icons', () => {
    const wrapper = mount(VTextField, {
      propsData: {
        counter: true,
        label: 'foo',
        hint: 'bar',
        persistentHint: true,
        light: true,
        prependIcon: 'prepend',
        appendIcon: 'append',
        prependInnerIcon: 'prepend-inner',
        appendOuterIcon: 'append-outer'
      }
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
