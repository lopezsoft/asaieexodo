<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @method static create(array $array)
 * @property array|mixed $settings
 * @property int|mixed $state
 * @property mixed $school_id
 */
class WatermarkFile extends Model
{
    use HasFactory;
    protected $casts = [
        'metadata' => 'array',
        'settings' => 'array',
        'last_modified' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        'created_at' => 'datetime:Y-m-d H:i:s',
    ];
    protected $fillable = [
        'uuid',
        'school_id',
        'file_name',
        'file_description',
        'file_path',
        'url',
        'extension_file',
        'mime_type',
        'size_file',
        'last_modified',
        'settings',
        'state',
    ];
    protected $hidden = [
        'metadata',
    ];
    protected $appends = [
        'paper_size',
        'available_in',
        'hide_footer',
        'hide_header',
        'margin_bottom',
        'margin_top',
    ];
    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            $model->uuid = (string) Str::uuid();
            self::setHistoryData($model, 'create');
        });
        static::updating(function ($model) {
           self::setHistoryData($model);
        });
    }
    private static function setHistoryData($model, string $action = 'update'): void
    {
        $ip                 = request()->ip();
        $user               = auth()->user();
        // Obtiene el estado original del modelo
        $originalAttributes = $model->getOriginal();
        // Obtiene el estado actual del modelo
        $currentAttributes  = $model->getAttributes();
        // inicializa un array para almacenar el historial
        $history            = [];
        // recorre cada atributo actual y comprueba si ha cambiado
        if(count($originalAttributes) === 0) {
            foreach ($currentAttributes as $key => $value) {
                if ($key === 'metadata') {
                    continue;
                }
                $change = [
                    'attribute' => $key,
                    'from'      => null,
                    'to'        => $value
                ];
                // añade el cambio al historial
                $history[] = $change;
            }
        }else {
            foreach ($currentAttributes as $key => $value) {
                if ($key === 'metadata') {
                    continue;
                }
                if (isset($originalAttributes[$key]) && $originalAttributes[$key] !== $value) {
                    $change = [
                        'attribute' => $key,
                        'from'      => $originalAttributes[$key],
                        'to'        => $value
                    ];
                    // añade el cambio al historial
                    $history[] = $change;
                }
            }
        }
        $history    = [
            'changes'   => $history,
            'at'        => now()->toDateTimeString(), // usa el helper now() de Laravel para obtener la fecha y hora actual,
            'timestamp' => now()->timestamp, // usa el helper now() de Laravel para obtener la fecha y hora actual,
            'action'    => $action, // podría ser 'create', 'delete', 'restore', 'forceDelete', etc.
            'userId'    => $user->id,
            'by'        => $user->name  . ' (' . $user->email . ')',
            'ip'        => $ip,
        ];
        // actualiza el campo 'metadata' con el historial
        $data                   = $model->metadata;
        $data['histories'][]    = $history;
        $model->metadata        = $data;
    }
    public function setSettingsAttribute($value): void
    {
        $this->attributes['settings'] = json_encode($value);
    }
    public function getPaperSizeAttribute()
    {
        return $this->settings['paper_size'] ?? null;
    }
    public function getAvailableInAttribute()
    {
        return $this->settings['available_in'] ?? null;
    }
    public function getHideHeaderAttribute()
    {
        return $this->settings['hide_header'] ?? null;
    }
    public function getHideFooterAttribute()
    {
        return $this->settings['hide_footer'] ?? null;
    }
    public function getMarginTopAttribute()
    {
        return $this->settings['margin_top'] ?? null;
    }
    public function getMarginBottomAttribute()
    {
        return $this->settings['margin_bottom'] ?? null;
    }
}
